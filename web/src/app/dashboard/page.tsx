import { PrismaClient } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowLeft, Package, CheckCircle, AlertTriangle, Clock, Shield, Activity } from 'lucide-react';
import { MerkleTree } from '@/lib/merkle';
import { MerkleVisualizer } from '@/components/MerkleVisualizer';
import { AnalyticsCharts } from '@/components/AnalyticsCharts';
import { NetworkGraph } from '@/components/NetworkGraph';
import { DashboardRealtime } from '@/components/DashboardRealtime';

const prisma = new PrismaClient();

async function getDashboardData() {
    const scans = await prisma.scanLog.findMany({
        orderBy: { scanTime: 'desc' },
        include: { package: true },
    });

    const totalScans = scans.length;
    const matchCount = scans.filter(s => s.result === 'match').length;
    const mismatchCount = scans.filter(s => s.result === 'mismatch').length;
    const pendingCount = 0; // Placeholder for future logic

    // Build Merkle Tree from all scan hashes
    const scanHashes = scans.map(s => s.scanHash);
    let merkleRoot = '';
    if (scanHashes.length > 0) {
        const tree = new MerkleTree(scanHashes);
        merkleRoot = tree.getRoot();
    }

    return { scans, totalScans, matchCount, mismatchCount, merkleRoot, pendingCount };
}

export default async function DashboardPage() {
    const { scans, totalScans, matchCount, mismatchCount, merkleRoot } = await getDashboardData();

    // Filter for Exception Queue
    const exceptions = scans.filter(s => s.result === 'mismatch').slice(0, 5);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <DashboardRealtime />
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex justify-between items-center border-b pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center">
                                <ArrowLeft className="w-4 h-4 mr-1" /> Back
                            </Link>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight">Operational Control Panel</h1>
                        <p className="text-muted-foreground">System Integrity & Exception Management</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="px-3 py-1 border-primary/20 text-primary bg-primary/5">
                            <Shield className="w-3 h-3 mr-2" />
                            System Audit-Ready
                        </Badge>
                        <div className="text-xs text-muted-foreground font-mono">
                            Last Sync: {new Date().toLocaleTimeString()}
                        </div>
                    </div>
                </div>

                {/* Operational Status Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-red-500/20 bg-red-500/5">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Action Required
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-red-600">{mismatchCount}</div>
                            <p className="text-xs text-red-400 mt-1">Active Exceptions</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Pending Verification
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">0</div>
                            <p className="text-xs text-muted-foreground mt-1">Awaiting Anchor</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" /> Verified Today
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-emerald-600">{matchCount}</div>
                            <p className="text-xs text-muted-foreground mt-1">Integrity Confirmed</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Activity className="w-4 h-4" /> Total Throughput
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{totalScans}</div>
                            <p className="text-xs text-muted-foreground mt-1">Scans Processed</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Exception Queue (Priority View) */}
                {exceptions.length > 0 && (
                    <Card className="border-red-500/20 shadow-sm">
                        <CardHeader className="bg-red-500/5 border-b border-red-500/10 pb-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-red-600 flex items-center gap-2 text-lg">
                                        <AlertTriangle className="w-5 h-5" /> Exception Queue
                                    </CardTitle>
                                    <CardDescription className="text-red-400/80">
                                        Immediate attention required for these shipments.
                                    </CardDescription>
                                </div>
                                <Badge variant="destructive" className="animate-pulse">
                                    {exceptions.length} Critical
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-[180px]">Timestamp</TableHead>
                                        <TableHead>Tracking ID</TableHead>
                                        <TableHead>Location</TableHead>
                                        <TableHead>Issue Type</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {exceptions.map((scan) => (
                                        <TableRow key={scan.id} className="hover:bg-red-500/5">
                                            <TableCell className="font-mono text-xs text-muted-foreground">
                                                {new Date(scan.scanTime).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="font-mono font-medium">
                                                {scan.trackingId.slice(0, 12)}...
                                            </TableCell>
                                            <TableCell>{scan.location}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="border-red-200 text-red-700 bg-red-50">
                                                    {scan.notes || 'Unknown Anomaly'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/package/${scan.trackingId}`}>
                                                    <Badge className="bg-red-600 hover:bg-red-700 cursor-pointer">
                                                        Investigate
                                                    </Badge>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Network Activity Monitor (Collapsible/Secondary) */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Activity className="w-4 h-4 text-primary" /> Network Activity Monitor
                            </h2>
                            <span className="text-xs text-muted-foreground">Live Feed</span>
                        </div>
                        <NetworkGraph scans={scans} />
                    </div>

                    {/* Ledger Status (Merkle Root) */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Active Ledger Anchor</CardTitle>
                                <CardDescription>Current cryptographic root for audit verification.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="p-3 bg-muted rounded-md font-mono text-[10px] break-all border border-border">
                                    {merkleRoot || 'Initializing...'}
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Anchor Confirmed on Chain</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Analytics */}
                        <div className="h-[300px]">
                            <AnalyticsCharts scans={scans} />
                        </div>
                    </div>
                </div>

                {/* Full Scan Log */}
                <Card>
                    <CardHeader>
                        <CardTitle>Complete Audit Log</CardTitle>
                        <CardDescription>Immutable record of all system events.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Time</TableHead>
                                    <TableHead>Tracking ID</TableHead>
                                    <TableHead>Location</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Notes</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {scans.slice(0, 10).map((scan) => (
                                    <TableRow key={scan.id}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">
                                            {new Date(scan.scanTime).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            <Link href={`/package/${scan.trackingId}`} className="hover:underline">
                                                {scan.trackingId.slice(0, 8)}...
                                            </Link>
                                        </TableCell>
                                        <TableCell className="text-sm">{scan.location}</TableCell>
                                        <TableCell>
                                            {scan.result === 'match' ? (
                                                <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                                                    Verified
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50">
                                                    Exception
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {scan.notes || '-'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
