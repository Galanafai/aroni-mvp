'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ScanLog } from '@prisma/client';
import { X, ShieldCheck, AlertTriangle, Package, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';

interface LocationDetailProps {
    locationId: string | null;
    scans: ScanLog[];
    onClose: () => void;
}

export function LocationDetail({ locationId, scans, onClose }: LocationDetailProps) {
    if (!locationId) return null;

    // Filter scans for this location
    const locScans = scans.filter(s => s.location === locationId);
    const total = locScans.length;
    const mismatches = locScans.filter(s => s.result === 'mismatch').length;
    const riskScore = total > 0 ? Math.round((mismatches / total) * 100) : 0;

    // Get recent activity (last 10)
    const recentActivity = [...locScans]
        .sort((a, b) => new Date(b.scanTime).getTime() - new Date(a.scanTime).getTime())
        .slice(0, 10);

    return (
        <AnimatePresence>
            {locationId && (
                <>
                    {/* Backdrop removed to allow graph interaction */}


                    {/* Slide-out Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[400px] bg-background border-l border-border z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-start justify-between bg-muted/20">
                            <div>
                                <h2 className="text-xl font-bold flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-primary" />
                                    {locationId.split('-')[0]}
                                </h2>
                                <p className="text-sm text-muted-foreground">{locationId}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={onClose}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Fixed Stats Section */}
                        <div className="p-6 border-b border-border space-y-6 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-muted/30 border-border">
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <div className="text-2xl font-bold">{total}</div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Total Scans</div>
                                    </CardContent>
                                </Card>
                                <Card className={`${riskScore > 0 ? 'bg-red-500/10 border-red-500/30' : 'bg-emerald-500/10 border-emerald-500/30'}`}>
                                    <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                                        <div className={`text-2xl font-bold ${riskScore > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {riskScore}%
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">Exception Rate</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Status Indicator */}
                            <div className={`p-4 rounded-lg border flex items-center gap-3 ${riskScore > 10 ? 'bg-red-500/10 border-red-500/20 text-red-200' :
                                riskScore > 0 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200' :
                                    'bg-emerald-500/10 border-emerald-500/20 text-emerald-200'
                                }`}>
                                {riskScore > 0 ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                                <div className="text-sm font-medium">
                                    {riskScore > 10 ? 'Critical Exception Rate' :
                                        riskScore > 0 ? 'Exceptions Logged' :
                                            'Audit Status: Clean'}
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Activity List */}
                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
                                    <Package className="w-4 h-4" /> Recent Activity
                                </h3>
                                <div className="space-y-3">
                                    {recentActivity.map((scan) => (
                                        <div key={scan.id} className="flex items-start gap-3 p-3 rounded-md border bg-card/50 hover:bg-card transition-colors">
                                            <div className={`mt-1 w-2 h-2 rounded-full ${scan.result === 'match' ? 'bg-emerald-600' : 'bg-red-500 animate-pulse'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs font-mono text-muted-foreground truncate w-24">
                                                        {scan.trackingId.slice(0, 8)}...
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {new Date(scan.scanTime).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-medium leading-none mb-1">
                                                    {scan.result === 'match' ? 'Scan Verified' : 'Exception Logged'}
                                                </p>
                                                {scan.notes && (
                                                    <p className="text-xs text-muted-foreground line-clamp-1">
                                                        {scan.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollArea>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
