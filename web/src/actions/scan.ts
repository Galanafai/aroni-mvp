'use server';

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prisma = new PrismaClient();

const scanSchema = z.object({
    trackingId: z.string().uuid(),
    scannedQuantity: z.number().int().min(0),
    scannedWeightKg: z.number().min(0),
    scannedDimensions: z.array(z.number().min(0)).length(3),
    location: z.string().optional(),
});

export type ScanState = {
    success: boolean;
    message?: string;
    result?: 'match' | 'mismatch';
    reasons?: string[];
    errors?: Record<string, string[]>;
};

export async function submitScan(prevState: ScanState, formData: FormData): Promise<ScanState> {
    const dimString = formData.get('scannedDimensions') as string;
    const dimensions = dimString ? dimString.split(',').map(Number) : [];

    const rawData = {
        trackingId: formData.get('trackingId'),
        scannedQuantity: Number(formData.get('scannedQuantity')),
        scannedWeightKg: Number(formData.get('scannedWeightKg')),
        scannedDimensions: dimensions,
        location: formData.get('location') || undefined,
    };

    const validatedFields = scanSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        };
    }

    const data = validatedFields.data;

    try {
        // Fetch stored metadata
        const stored = await prisma.packageMetadata.findUnique({
            where: { id: data.trackingId },
        });

        if (!stored) {
            return {
                success: false,
                message: 'Tracking ID not found',
            };
        }

        // Compare fields
        let result: 'match' | 'mismatch' = 'match';
        const reasons: string[] = [];

        if (stored.quantity !== data.scannedQuantity) {
            result = 'mismatch';
            reasons.push('quantity mismatch');
        }

        // Use a small tolerance for float comparison if needed, but strict for now as per Go code
        if (stored.weightKg !== data.scannedWeightKg) {
            result = 'mismatch';
            reasons.push('weight mismatch');
        }

        const storedDims = JSON.parse(stored.dimensions) as number[];
        if (storedDims.length === 3 && data.scannedDimensions.length === 3) {
            for (let i = 0; i < 3; i++) {
                if (storedDims[i] !== data.scannedDimensions[i]) {
                    result = 'mismatch';
                    reasons.push('dimensions mismatch');
                    break;
                }
            }
        } else {
            result = 'mismatch';
            reasons.push('dimensions format mismatch');
        }

        // Compute scan hash
        const scanLogPayload = {
            tracking_id: data.trackingId,
            location: data.location,
            scanned_quantity: data.scannedQuantity,
            scanned_weight_kg: data.scannedWeightKg,
            scanned_dimensions: data.scannedDimensions,
            result: result,
            notes: reasons.join(', '),
            scan_time: new Date().toISOString(),
        };

        const scanHash = createHash('sha256')
            .update(JSON.stringify(scanLogPayload))
            .digest('hex');

        // Log the scan
        const newScan = await prisma.scanLog.create({
            data: {
                trackingId: data.trackingId,
                scannedQuantity: data.scannedQuantity,
                scannedWeightKg: data.scannedWeightKg,
                scannedDimensions: JSON.stringify(data.scannedDimensions),
                location: data.location,
                result: result,
                notes: reasons.join(', '),
                scanHash: scanHash,
            },
        });

        // Emit event for real-time updates
        // We need to dynamically import to avoid edge runtime issues if any, 
        // but since this is a server action it runs in Node environment usually.
        // However, to be safe and clean:
        const { eventEmitter } = await import('@/lib/events');
        eventEmitter.emit('new_scan', newScan);

        revalidatePath('/dashboard');
        return {
            success: true,
            message: 'Scan submitted successfully',
            result: result,
            reasons: reasons,
        };

    } catch (error) {
        console.error('Database Error:', error);
        return {
            success: false,
            message: 'Failed to process scan',
        };
    }
}
