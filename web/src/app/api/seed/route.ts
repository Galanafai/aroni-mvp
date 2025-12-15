import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Helper to compute hash
function computeHash(payload: any) {
    return createHash('sha256')
        .update(JSON.stringify(payload))
        .digest('hex');
}

// Helper to get random item from array
function getRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to generate random date within last N days
function getRandomDate(daysAgo: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
    date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
    return date;
}

const LOCATIONS = [
    'Shanghai-Port', 'Singapore-Hub', 'Rotterdam-Gateway', 'LA-LongBeach',
    'NY-Newark', 'Hamburg-Port', 'Dubai-JebelAli', 'Tokyo-Port',
    'Mumbai-Port', 'Shenzhen-Port'
];

const PRODUCTS = [
    { sku: 'IPHONE-15-PRO', weight: 0.2, dims: [15, 8, 1], type: 'item' },
    { sku: 'PS5-CONSOLE', weight: 4.5, dims: [40, 26, 10], type: 'box' },
    { sku: 'NIKE-AIR-MAX', weight: 1.2, dims: [35, 25, 12], type: 'box' },
    { sku: 'SAMSUNG-TV-65', weight: 25.0, dims: [145, 85, 15], type: 'pallet' },
    { sku: 'TESLA-BATTERY', weight: 450.0, dims: [200, 120, 10], type: 'container' },
    { sku: 'VACCINE-BATCH', weight: 5.0, dims: [30, 30, 30], type: 'cooler' },
    { sku: 'COFFEE-BEANS', weight: 60.0, dims: [90, 60, 60], type: 'sack' },
    { sku: 'AUTO-PARTS', weight: 15.0, dims: [40, 40, 20], type: 'crate' },
];

export async function GET() {
    try {
        // Clear existing data
        await prisma.scanLog.deleteMany();
        await prisma.packageMetadata.deleteMany();

        const createdPackages = [];
        const createdScans = [];

        // Generate 50 Packages
        for (let i = 0; i < 50; i++) {
            const prod = getRandom(PRODUCTS);
            const source = getRandom(LOCATIONS);
            let dest = getRandom(LOCATIONS);
            while (dest === source) dest = getRandom(LOCATIONS); // Ensure distinct dest

            const quantity = Math.floor(Math.random() * 100) + 1;
            const totalWeight = prod.weight * quantity;
            const trackingId = uuidv4();

            // Create Metadata
            const pkg = await prisma.packageMetadata.create({
                data: {
                    id: trackingId,
                    sku: prod.sku,
                    quantity: quantity,
                    weightKg: parseFloat(totalWeight.toFixed(2)),
                    dimensions: JSON.stringify(prod.dims),
                    packageType: prod.type,
                    sourceId: source,
                    destinationId: dest,
                    urgencyLevel: getRandom(['normal', 'priority', 'critical']),
                    hsCode: '850000', // Placeholder
                },
            });
            createdPackages.push(pkg);

            // Generate Route (Source -> Transit -> Transit -> Dest)
            const routeLength = Math.floor(Math.random() * 3) + 2; // 2 to 4 stops
            const route = [source];
            for (let j = 0; j < routeLength - 2; j++) {
                route.push(getRandom(LOCATIONS));
            }
            route.push(dest);

            // Generate Scans along route
            let currentScanTime = getRandomDate(30); // Start sometime in last 30 days

            for (const loc of route) {
                // Advance time by 1-3 days per hop
                currentScanTime = new Date(currentScanTime.getTime() + (Math.random() * 3 + 1) * 24 * 60 * 60 * 1000);
                if (currentScanTime > new Date()) break; // Don't scan in future

                // Simulate Anomaly (15% chance, but never at source)
                const isAnomaly = loc !== source && Math.random() < 0.15;

                let scanQty = quantity;
                let scanWeight = totalWeight;
                let scanDims = prod.dims;
                let result = 'match';
                let notes = 'Verified at checkpoint';

                if (isAnomaly) {
                    result = 'mismatch';
                    const type = Math.random();
                    if (type < 0.33) {
                        scanQty = Math.max(1, quantity - Math.floor(Math.random() * 5));
                        notes = 'Quantity mismatch: Potential theft';
                    } else if (type < 0.66) {
                        scanWeight = totalWeight * 0.8; // 20% lighter
                        notes = 'Weight discrepancy detected';
                    } else {
                        scanDims = [prod.dims[0] * 0.9, prod.dims[1], prod.dims[2]]; // Crushed?
                        notes = 'Dimension mismatch: Cargo damage';
                    }
                }

                const payload = {
                    tracking_id: trackingId,
                    location: loc,
                    scanned_quantity: scanQty,
                    scanned_weight_kg: parseFloat(scanWeight.toFixed(2)),
                    scanned_dimensions: scanDims,
                    result: result,
                    notes: notes,
                    scan_time: currentScanTime.toISOString(),
                };

                await prisma.scanLog.create({
                    data: {
                        trackingId: trackingId,
                        scannedQuantity: scanQty,
                        scannedWeightKg: parseFloat(scanWeight.toFixed(2)),
                        scannedDimensions: JSON.stringify(scanDims),
                        location: loc,
                        result: result,
                        notes: notes,
                        scanHash: computeHash(payload),
                        scanTime: currentScanTime,
                    },
                });
            }
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${createdPackages.length} packages with varied routes and anomalies.`
        });

    } catch (error) {
        console.error('Seeding failed:', error);
        return NextResponse.json({ success: false, error: 'Seeding failed' }, { status: 500 });
    }
}
