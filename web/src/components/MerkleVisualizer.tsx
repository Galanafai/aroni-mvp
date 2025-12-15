'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScanLog } from '@prisma/client';
import { MerkleTree } from '@/lib/merkle';
import { Lock, FileCheck, GitCommit } from 'lucide-react';

interface MerkleVisualizerProps {
    scans: ScanLog[];
}

export function MerkleVisualizer({ scans }: MerkleVisualizerProps) {
    const [selectedHash, setSelectedHash] = useState<string | null>(null);

    // Reconstruct tree structure for visualization
    const treeData = useMemo(() => {
        if (scans.length === 0) return null;
        const leaves = scans.map(s => s.scanHash);
        const tree = new MerkleTree(leaves);
        return {
            levels: tree.levels,
            root: tree.getRoot(),
        };
    }, [scans]);

    if (!treeData) return null;

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <GitCommit className="w-5 h-5 text-primary" />
                    Merkle Tree Visualization
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto pb-4">
                    <div className="min-w-[600px] flex flex-col-reverse items-center gap-8 py-8">
                        {treeData.levels.map((level, levelIndex) => (
                            <div key={levelIndex} className="flex justify-center gap-4 relative">
                                {level.map((hash, nodeIndex) => {
                                    const isRoot = levelIndex === treeData.levels.length - 1;
                                    const isLeaf = levelIndex === 0;
                                    const isSelected = selectedHash === hash;

                                    return (
                                        <motion.div
                                            key={`${levelIndex}-${nodeIndex}`}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: levelIndex * 0.1 + nodeIndex * 0.05 }}
                                            className="relative z-10"
                                        >
                                            <button
                                                onClick={() => setSelectedHash(hash)}
                                                className={`
                          w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                          ${isRoot ? 'border-primary bg-primary/10' : 'border-muted-foreground/20 bg-background'}
                          ${isSelected ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'}
                        `}
                                            >
                                                {isRoot ? (
                                                    <Lock className="w-5 h-5 text-primary" />
                                                ) : isLeaf ? (
                                                    <FileCheck className="w-5 h-5 text-muted-foreground" />
                                                ) : (
                                                    <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />
                                                )}
                                            </button>

                                            {/* Connection Lines (Simplified) */}
                                            {levelIndex < treeData.levels.length - 1 && (
                                                <div className="absolute -top-8 left-1/2 w-px h-8 bg-border -z-10" />
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {selectedHash && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-muted/50 p-4 rounded-lg border text-center"
                        >
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-bold">Selected Hash</p>
                            <p className="font-mono text-xs break-all">{selectedHash}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
