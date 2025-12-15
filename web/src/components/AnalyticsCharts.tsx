'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLog } from '@prisma/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useMemo } from 'react';

interface AnalyticsChartsProps {
    scans: ScanLog[];
}

export function AnalyticsCharts({ scans }: AnalyticsChartsProps) {

    // 1. Process data for Integrity Heatmap (Mismatches by Location)
    const integrityData = useMemo(() => {
        const locationMap = new Map<string, { location: string; matches: number; mismatches: number }>();

        scans.forEach(scan => {
            const loc = scan.location || 'Unknown';
            if (!locationMap.has(loc)) {
                locationMap.set(loc, { location: loc, matches: 0, mismatches: 0 });
            }
            const entry = locationMap.get(loc)!;
            if (scan.result === 'match') entry.matches++;
            else entry.mismatches++;
        });

        return Array.from(locationMap.values());
    }, [scans]);

    // 2. Process data for Volume Trends (Scans over time)
    const volumeData = useMemo(() => {
        // Group by date (YYYY-MM-DD)
        const dateMap = new Map<string, { date: string; count: number }>();

        // Sort scans by time first
        const sortedScans = [...scans].sort((a, b) => new Date(a.scanTime).getTime() - new Date(b.scanTime).getTime());

        sortedScans.forEach(scan => {
            const date = new Date(scan.scanTime).toLocaleDateString();
            if (!dateMap.has(date)) {
                dateMap.set(date, { date, count: 0 });
            }
            dateMap.get(date)!.count++;
        });

        return Array.from(dateMap.values());
    }, [scans]);

    return (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Integrity Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Network Integrity</CardTitle>
                    <CardDescription>Scan results by location.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={integrityData}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="location" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Bar dataKey="matches" name="Verified" fill="#22c55e" radius={[4, 4, 0, 0]} stackId="a" />
                            <Bar dataKey="mismatches" name="Mismatch" fill="#ef4444" radius={[4, 4, 0, 0]} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Volume Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Scan Volume</CardTitle>
                    <CardDescription>Activity over time.</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeData}>
                            <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                itemStyle={{ color: 'hsl(var(--foreground))' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCount)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
