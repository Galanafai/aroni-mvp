import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { MerkleTree } from '@/lib/merkle';

const prisma = new PrismaClient();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ trackingId: string }> }
) {
    const { trackingId } = await params;

    // 1. Fetch the specific scan log
    const targetScan = await prisma.scanLog.findFirst({
        where: { trackingId: trackingId },
    });

    if (!targetScan) {
        return NextResponse.json({ error: 'Scan not found' }, { status: 404 });
    }

    // 2. Fetch ALL scan hashes to build the tree
    // In a real production system with millions of rows, you'd use a more efficient storage strategy
    // (e.g. storing the tree or using a sparse tree), but for MVP this is perfect.
    const allScans = await prisma.scanLog.findMany({
        select: { scanHash: true },
        orderBy: { scanTime: 'desc' }, // Ensure consistent order if needed, though sorting in MerkleTree handles it
    });

    const leaves = allScans.map(s => s.scanHash);
    const tree = new MerkleTree(leaves);

    try {
        const proof = tree.getProof(targetScan.scanHash);
        const root = tree.getRoot();

        return NextResponse.json({
            trackingId,
            scanHash: targetScan.scanHash,
            proof,
            root,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to generate proof' }, { status: 500 });
    }
}
