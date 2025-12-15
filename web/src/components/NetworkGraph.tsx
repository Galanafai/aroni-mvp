'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScanLog } from '@prisma/client';
import { Activity, AlertTriangle, ShieldCheck, Globe } from 'lucide-react';
import { LocationDetail } from './LocationDetail';

interface NetworkGraphProps {
    scans: ScanLog[];
}

interface Node {
    id: string;
    x: number;
    y: number;
    type: 'source' | 'transit' | 'destination';
    riskScore: number;
    volume: number;
}

interface Edge {
    from: string;
    to: string;
    count: number;
    mismatches: number;
}

// Fixed Geographic Coordinates (approximate for visual layout)
const GEO_COORDS: Record<string, { x: number; y: number }> = {
    // Americas (Left)
    'LA-LongBeach': { x: 50, y: 150 },
    'NY-Newark': { x: 90, y: 120 },

    // Europe (Center)
    'Rotterdam-Gateway': { x: 180, y: 110 },
    'Hamburg-Port': { x: 190, y: 100 },

    // Middle East / South Asia (Center-Right)
    'Dubai-JebelAli': { x: 240, y: 160 },
    'Mumbai-Port': { x: 260, y: 170 },

    // East Asia (Right)
    'Singapore-Hub': { x: 300, y: 200 },
    'Shenzhen-Port': { x: 330, y: 160 },
    'Shanghai-Port': { x: 340, y: 140 },
    'Tokyo-Port': { x: 360, y: 130 },
};

export function NetworkGraph({ scans }: NetworkGraphProps) {
    const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

    const { nodes, edges } = useMemo(() => {
        const uniqueLocations = new Set<string>();
        const locationStats = new Map<string, { total: number; mismatches: number }>();
        const routeStats = new Map<string, { from: string; to: string; count: number; mismatches: number }>();

        const addStat = (loc: string, isMismatch: boolean) => {
            uniqueLocations.add(loc);
            const stats = locationStats.get(loc) || { total: 0, mismatches: 0 };
            stats.total++;
            if (isMismatch) stats.mismatches++;
            locationStats.set(loc, stats);
        };

        const scansByPackage = new Map<string, ScanLog[]>();
        scans.forEach(s => {
            const list = scansByPackage.get(s.trackingId) || [];
            list.push(s);
            scansByPackage.set(s.trackingId, list);
        });

        scansByPackage.forEach((pkgScans) => {
            pkgScans.sort((a, b) => new Date(a.scanTime).getTime() - new Date(b.scanTime).getTime());

            pkgScans.forEach((scan, i) => {
                const loc = scan.location || 'Unknown';
                const isMismatch = scan.result === 'mismatch';
                addStat(loc, isMismatch);

                if (i > 0) {
                    const prev = pkgScans[i - 1];
                    const prevLoc = prev.location || 'Unknown';
                    const key = `${prevLoc}-${loc}`;

                    const route = routeStats.get(key) || { from: prevLoc, to: loc, count: 0, mismatches: 0 };
                    route.count++;
                    if (isMismatch) route.mismatches++;
                    routeStats.set(key, route);
                }
            });
        });

        const nodeList = Array.from(uniqueLocations);
        const nodes: Node[] = nodeList.map((loc) => {
            const coords = GEO_COORDS[loc] || { x: 200, y: 200 }; // Fallback to center
            const stats = locationStats.get(loc)!;
            const risk = Math.round((stats.mismatches / stats.total) * 100);

            return {
                id: loc,
                x: coords.x,
                y: coords.y,
                type: 'transit',
                riskScore: risk,
                volume: stats.total,
            };
        });

        const edges: Edge[] = Array.from(routeStats.values());

        return { nodes, edges };
    }, [scans]);

    return (
        <>
            <Card className="col-span-full border-border bg-card/50 backdrop-blur-sm relative overflow-hidden">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        Network Activity Monitor
                    </CardTitle>
                    <CardDescription>Live visualization of logistics flow and exception hotspots.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center min-h-[400px] relative">

                    {/* World Map Background Hint - More Subtle */}
                    <div className="absolute inset-0 opacity-5 pointer-events-none">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
                    </div>

                    <svg width="100%" height="100%" viewBox="0 0 400 300" className="w-full h-full max-w-[800px] max-h-[600px] z-10">
                        <defs>
                            <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="20" refY="2" orient="auto">
                                <polygon points="0 0, 6 2, 0 4" fill="currentColor" className="text-muted-foreground/30" />
                            </marker>
                        </defs>

                        {/* Edges */}
                        {edges.map((edge, i) => {
                            const start = nodes.find(n => n.id === edge.from)!;
                            const end = nodes.find(n => n.id === edge.to)!;
                            const isRisky = edge.mismatches > 0;
                            const isPerfect = !isRisky && edge.count > 5;

                            // Calculate Bezier Control Point for curve
                            const midX = (start.x + end.x) / 2;
                            const midY = (start.y + end.y) / 2 - 25; // Curve upwards
                            const pathData = `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;

                            return (
                                <g key={i}>
                                    {/* Path Line */}
                                    <path
                                        d={pathData}
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth={isPerfect ? 1.5 : 1}
                                        className={`
                    ${isRisky ? 'text-red-500/40' : isPerfect ? 'text-emerald-600/30' : 'text-muted-foreground/10'}
                    transition-colors duration-500
                  `}
                                    />

                                    {/* Animated Particles - SLOWER & SMALLER */}
                                    <motion.circle
                                        r={isRisky ? 3 : 2}
                                        fill="currentColor"
                                        className={isRisky ? 'text-red-500' : isPerfect ? 'text-emerald-600' : 'text-muted-foreground'}
                                        initial={{ offsetDistance: "0%" }}
                                        animate={{ offsetDistance: "100%" }}
                                        style={{ offsetPath: `path("${pathData}")` }}
                                        transition={{
                                            duration: 8 + Math.random() * 4, // Much slower
                                            repeat: Infinity,
                                            ease: "linear",
                                            repeatDelay: Math.random() * 2
                                        }}
                                    />
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map((node) => {
                            const isHighRisk = node.riskScore > 0;
                            const isHub = node.volume > 10;
                            const isSelected = selectedLocation === node.id;

                            return (
                                <g
                                    key={node.id}
                                    onClick={() => setSelectedLocation(node.id)}
                                    className="cursor-pointer hover:opacity-80 transition-opacity"
                                >
                                    {/* Selection Ring */}
                                    {isSelected && (
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={20}
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1"
                                            className="text-primary animate-ping opacity-10"
                                        />
                                    )}

                                    {/* Pulse Effect for High Risk - Slower */}
                                    {isHighRisk && (
                                        <motion.circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={14}
                                            fill="currentColor"
                                            className="text-red-500/10"
                                            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                        />
                                    )}

                                    {/* Node Circle */}
                                    <circle
                                        cx={node.x}
                                        cy={node.y}
                                        r={isHub ? 4 : 3}
                                        fill="currentColor"
                                        className={`
                    ${isHighRisk ? 'text-red-600' : isSelected ? 'text-primary' : 'text-muted-foreground'} 
                    stroke-2 stroke-background transition-colors duration-300
                  `}
                                    />

                                    {/* Label */}
                                    <text
                                        x={node.x}
                                        y={node.y + 12}
                                        textAnchor="middle"
                                        className={`text-[5px] uppercase font-mono tracking-wider transition-all duration-300 ${isSelected ? 'fill-primary font-bold' : 'fill-muted-foreground opacity-60'}`}
                                    >
                                        {node.id.split('-')[0]}
                                    </text>
                                </g>
                            );
                        })}
                    </svg>

                    {/* Legend Overlay - Operational Terms */}
                    <div className="absolute bottom-4 right-4 bg-background/90 backdrop-blur p-3 rounded-lg border text-xs space-y-2 pointer-events-none shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-600" />
                            <span className="text-emerald-600 font-medium">Verified Route</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                            <span className="text-muted-foreground">Standard Traffic</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-red-500 font-medium">Exception Route</span>
                        </div>
                    </div>

                </CardContent>
            </Card>

            {/* Detail Sheet - Moved outside to escape Card's overflow/backdrop context */}
            <LocationDetail
                locationId={selectedLocation}
                scans={scans}
                onClose={() => setSelectedLocation(null)}
            />
        </>
    );
}
