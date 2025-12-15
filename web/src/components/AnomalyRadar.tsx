'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanLog, PackageMetadata } from '@prisma/client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useMemo } from 'react';
import { AlertTriangle } from 'lucide-react';

interface AnomalyRadarProps {
    pkg: PackageMetadata;
    scans: ScanLog[];
}

export function AnomalyRadar({ pkg, scans }: AnomalyRadarProps) {
    // Find the most recent "mismatch" scan to visualize
    const badScan = useMemo(() => {
        return scans.find(s => s.result === 'mismatch');
    }, [scans]);

    if (!badScan) return null;

    // Parse dimensions
    const expectedDims = JSON.parse(pkg.dimensions as string);
    const actualDims = JSON.parse(badScan.scannedDimensions as string);

    // Normalize data for Radar Chart (0-100 scale relative to expected)
    const data = [
        {
            subject: 'Quantity',
            Expected: 100,
            Actual: (badScan.scannedQuantity / pkg.quantity) * 100,
            fullMark: 100,
        },
        {
            subject: 'Weight',
            Expected: 100,
            Actual: (badScan.scannedWeightKg / pkg.weightKg) * 100,
            fullMark: 100,
        },
        {
            subject: 'Length',
            Expected: 100,
            Actual: (actualDims[0] / expectedDims[0]) * 100,
            fullMark: 100,
        },
        {
            subject: 'Width',
            Expected: 100,
            Actual: (actualDims[1] / expectedDims[1]) * 100,
            fullMark: 100,
        },
        {
            subject: 'Height',
            Expected: 100,
            Actual: (actualDims[2] / expectedDims[2]) * 100,
            fullMark: 100,
        },
    ];

    return (
        <Card className="border-red-500/20 bg-red-500/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                    <AlertTriangle className="w-5 h-5" />
                    Anomaly Detected
                </CardTitle>
                <CardDescription>
                    Discrepancy analysis for {badScan.location}.
                    <br />
                    Comparing <span className="text-primary font-medium">Expected</span> vs <span className="text-red-500 font-medium">Actual</span> values.
                </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="currentColor" opacity={0.1} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />

                        <Radar
                            name="Expected"
                            dataKey="Expected"
                            stroke="hsl(var(--primary))"
                            fill="hsl(var(--primary))"
                            fillOpacity={0.3}
                        />
                        <Radar
                            name="Actual Scan"
                            dataKey="Actual"
                            stroke="#ef4444"
                            fill="#ef4444"
                            fillOpacity={0.5}
                        />

                        <Legend />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
