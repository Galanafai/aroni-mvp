'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const prisma = new PrismaClient();

const metadataSchema = z.object({
    sku: z.string().min(1, 'SKU is required'),
    quantity: z.number().int().min(0),
    weightKg: z.number().min(0),
    dimensions: z.array(z.number().min(0)).length(3),
    packageType: z.string().min(1),
    sourceId: z.string().min(1),
    destinationId: z.string().min(1),
    carrierId: z.string().optional(),
    urgencyLevel: z.enum(['normal', 'priority', 'critical']),
    hsCode: z.string().min(1),
    nestedWithin: z.string().optional(),
});

export type MetadataState = {
    success: boolean;
    message?: string;
    trackingId?: string;
    errors?: Record<string, string[]>;
};

export async function submitMetadata(prevState: MetadataState, formData: FormData): Promise<MetadataState> {
    // Parse dimensions from comma-separated string or multiple inputs
    // For simplicity, assuming the form sends 'dimensions' as "L,W,H" string
    const dimString = formData.get('dimensions') as string;
    const dimensions = dimString ? dimString.split(',').map(Number) : [];

    const rawData = {
        sku: formData.get('sku'),
        quantity: Number(formData.get('quantity')),
        weightKg: Number(formData.get('weightKg')),
        dimensions: dimensions,
        packageType: formData.get('packageType'),
        sourceId: formData.get('sourceId'),
        destinationId: formData.get('destinationId'),
        carrierId: formData.get('carrierId') || undefined,
        urgencyLevel: formData.get('urgencyLevel'),
        hsCode: formData.get('hsCode'),
        nestedWithin: formData.get('nestedWithin') || undefined,
    };

    const validatedFields = metadataSchema.safeParse(rawData);

    if (!validatedFields.success) {
        return {
            success: false,
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Validation failed',
        };
    }

    try {
        const data = validatedFields.data;

        const newPackage = await prisma.packageMetadata.create({
            data: {
                sku: data.sku,
                quantity: data.quantity,
                weightKg: data.weightKg,
                dimensions: JSON.stringify(data.dimensions),
                packageType: data.packageType,
                sourceId: data.sourceId,
                destinationId: data.destinationId,
                carrierId: data.carrierId,
                urgencyLevel: data.urgencyLevel,
                hsCode: data.hsCode,
                nestedWithin: data.nestedWithin,
            },
        });

        revalidatePath('/dashboard');
        return {
            success: true,
            message: 'Metadata submitted successfully',
            trackingId: newPackage.id,
        };
    } catch (error) {
        console.error('Database Error:', error);
        return {
            success: false,
            message: 'Failed to save metadata',
        };
    }
}
