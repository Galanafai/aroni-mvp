'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, XCircle, Shield, Loader2, Lock } from 'lucide-react';
import Link from 'next/link';

type ProofData = {
    trackingId: string;
    scanHash: string;
    proof: string[];
    root: string;
};

export default function VerifyPage() {
    const [trackingId, setTrackingId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<'verified' | 'failed' | null>(null);
    const [proofData, setProofData] = useState<ProofData | null>(null);
    const [error, setError] = useState('');

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult(null);
        setError('');
        setProofData(null);

        try {
            // 1. Fetch Proof from Server
            const res = await fetch(`/api/proof/${trackingId}`);
            if (!res.ok) {
                throw new Error('Scan not found or proof unavailable');
            }
            const data: ProofData = await res.json();
            setProofData(data);

            // 2. Perform Client-Side Verification
            // We import the hashing logic dynamically or implement a simple version here
            // For demonstration, we'll implement the SHA-256 verify loop right here in the browser
            const isValid = await verifyMerkleProof(data.scanHash, data.proof, data.root);

            if (isValid) {
                setResult('verified');
            } else {
                setResult('failed');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>

                <Card className="border-2 border-primary/10 shadow-lg">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full w-fit mb-4">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                        <CardTitle className="text-2xl">Cryptographic Audit</CardTitle>
                        <CardDescription>
                            Verify the integrity of a scan record directly in your browser.
                            <br />
                            This process runs locally, ensuring "Don't Trust, Verify".
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="trackingId">Tracking ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="trackingId"
                                        placeholder="Enter UUID..."
                                        value={trackingId}
                                        onChange={(e) => setTrackingId(e.target.value)}
                                        required
                                    />
                                    <Button type="submit" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Audit'}
                                    </Button>
                                </div>
                            </div>
                        </form>

                        {error && (
                            <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}

                        {result && proofData && (
                            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className={`p-6 rounded-lg border-2 ${result === 'verified' ? 'border-green-100 bg-green-50/50' : 'border-red-100 bg-red-50/50'}`}>
                                    <div className="flex flex-col items-center text-center mb-6">
                                        {result === 'verified' ? (
                                            <>
                                                <CheckCircle className="w-16 h-16 text-green-500 mb-2" />
                                                <h3 className="text-xl font-bold text-green-700">Integrity Verified</h3>
                                                <p className="text-green-600 text-sm">The Merkle Proof is valid. This record is immutable.</p>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-16 h-16 text-red-500 mb-2" />
                                                <h3 className="text-xl font-bold text-red-700">Verification Failed</h3>
                                                <p className="text-red-600 text-sm">The proof provided does not match the root hash.</p>
                                            </>
                                        )}
                                    </div>

                                    <Separator className="my-4" />

                                    <div className="space-y-3 text-xs font-mono">
                                        <div>
                                            <span className="text-muted-foreground block mb-1">Scan Hash (Leaf)</span>
                                            <div className="bg-background p-2 rounded border break-all">{proofData.scanHash}</div>
                                        </div>

                                        <div className="flex flex-col items-center gap-1 py-2 text-muted-foreground">
                                            <Lock className="w-3 h-3" />
                                            <span>+ {proofData.proof.length} Sibling Hashes</span>
                                        </div>

                                        <div>
                                            <span className="text-muted-foreground block mb-1">Merkle Root (Anchor)</span>
                                            <div className="bg-background p-2 rounded border break-all font-bold text-primary">
                                                {proofData.root}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Client-side implementation of Merkle Proof verification
async function verifyMerkleProof(leaf: string, proof: string[], root: string): Promise<boolean> {
    // We use the Web Crypto API for client-side hashing
    const encoder = new TextEncoder();

    const sha256 = async (data: Uint8Array): Promise<string> => {
        const hashBuffer = await crypto.subtle.digest('SHA-256', data.buffer as ArrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    };

    let computedHash = leaf;

    for (const sibling of proof) {
        // Sort pairs to match server-side logic
        const sorted = [computedHash, sibling].sort();

        // Convert hex strings to byte arrays
        const bufferA = hexToBytes(sorted[0]);
        const bufferB = hexToBytes(sorted[1]);

        // Concat
        const combined = new Uint8Array(bufferA.length + bufferB.length);
        combined.set(bufferA);
        combined.set(bufferB, bufferA.length);

        computedHash = await sha256(combined);
    }

    return computedHash === root;
}

function hexToBytes(hex: string): Uint8Array {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}
