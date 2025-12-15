import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Box, MapPin, Calendar, CheckCircle, AlertTriangle, Truck, Anchor } from 'lucide-react';
import { notFound } from 'next/navigation';
import { AnomalyRadar } from '@/components/AnomalyRadar';

const prisma = new PrismaClient();

async function getPackageData(id: string) {
    const pkg = await prisma.packageMetadata.findUnique({
        where: { id },
        include: {
            scans: {
                orderBy: { scanTime: 'desc' },
            },
        },
    });
    return pkg;
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const pkg = await getPackageData(id);

    if (!pkg) {
        notFound();
    }

    const isTampered = pkg.scans.some(s => s.result === 'mismatch');
    const latestScan = pkg.scans[0];

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/dashboard" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
                    </Link>
                </div>

                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            {pkg.sku}
                            {isTampered ? (
                                <Badge variant="destructive" className="text-lg px-3 py-1">Tampered</Badge>
                            ) : (
                                <Badge variant="outline" className="text-lg px-3 py-1 bg-green-50 text-green-700 border-green-200">
                                    <CheckCircle className="w-4 h-4 mr-2" /> Verified Safe
                                </Badge>
                            )}
                        </h1>
                        <p className="text-muted-foreground font-mono mt-2 text-sm">ID: {pkg.id}</p>
                    </div>
                    <div className="flex gap-2">
                        <Button asChild variant="outline">
                            <Link href={`/verify?id=${pkg.id}`}>
                                <Anchor className="w-4 h-4 mr-2" /> Audit Proof
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Left Column: Metadata */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Box className="w-5 h-5" /> Cargo Manifest
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground block">Description</span>
                                    <span className="font-medium">{(pkg as any).description || 'Standard Cargo'}</span>
                                </div>
                                <Separator />
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-muted-foreground block">Quantity</span>
                                        <span className="font-medium">{pkg.quantity} units</span>
                                    </div>
                                    <div>
                                        <span className="text-muted-foreground block">Weight</span>
                                        <span className="font-medium">{pkg.weightKg} kg</span>
                                    </div>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block">Dimensions</span>
                                    <span className="font-medium font-mono text-xs">{pkg.dimensions}</span>
                                </div>
                                <Separator />
                                <div>
                                    <span className="text-muted-foreground block">Route</span>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Badge variant="secondary">{pkg.sourceId}</Badge>
                                        <span className="text-muted-foreground">→</span>
                                        <Badge variant="secondary">{pkg.destinationId}</Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Chain of Custody Timeline */}
                    <div className="md:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="w-5 h-5" /> Chain of Custody
                                </CardTitle>
                                <CardDescription>Immutable record of all scans and transfers.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative pl-8 border-l-2 border-muted space-y-8 py-2">
                                    {pkg.scans.map((scan, index) => (
                                        <div key={scan.id} className="relative">
                                            {/* Timeline Dot */}
                                            <div className={`
                        absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-background
                        ${scan.result === 'match' ? 'bg-green-500' : 'bg-red-500'}
                      `} />

                                            <div className="flex flex-col gap-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold text-lg">{scan.location || 'Unknown Location'}</h3>
                                                    <span className="text-xs text-muted-foreground font-mono">
                                                        {new Date(scan.scanTime).toLocaleString()}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {scan.result === 'match' ? (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                                                            Verified Match
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Mismatch Detected
                                                        </Badge>
                                                    )}
                                                </div>

                                                {scan.notes && (
                                                    <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                                                        "{scan.notes}"
                                                    </p>
                                                )}

                                                <div className="mt-2 text-xs font-mono text-muted-foreground truncate max-w-[300px]">
                                                    Hash: {scan.scanHash}
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Origin Point */}
                                    <div className="relative">
                                        <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-background bg-primary" />
                                        <div className="flex flex-col gap-1">
                                            <h3 className="font-semibold text-lg text-muted-foreground">Metadata Created</h3>
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {new Date(pkg.createdAt).toLocaleString()}
                                            </span>
                                            <p className="text-sm text-muted-foreground">Package registered in system.</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Anomaly Radar (Only if tampered) */}
                {isTampered && (
                    <div className="mt-6">
                        <AnomalyRadar pkg={pkg} scans={pkg.scans} />
                    </div>
                )}
            </div>
        </div>
    );
}
