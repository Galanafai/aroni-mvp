'use client';

import { useActionState } from 'react';

import { submitScan, ScanState } from '@/actions/scan';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { ArrowLeft, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

const initialState: ScanState = {
    success: false,
};

export default function ScanPage() {
    const [state, formAction, isPending] = useActionState(submitScan, initialState);

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Scan Verification</CardTitle>
                        <CardDescription>Enter scanned data to verify package integrity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {state.success ? (
                            <div className="text-center py-8">
                                {state.result === 'match' ? (
                                    <div className="flex flex-col items-center text-green-600">
                                        <CheckCircle className="w-16 h-16 mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">Scan Match</h3>
                                        <p className="text-muted-foreground">Package verified successfully.</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-red-600">
                                        <XCircle className="w-16 h-16 mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">Scan Mismatch</h3>
                                        <div className="bg-red-50 p-4 rounded-md w-full mt-4">
                                            <p className="font-semibold mb-2 text-red-900">Issues Detected:</p>
                                            <ul className="list-disc list-inside text-left text-sm text-red-800">
                                                {state.reasons?.map((reason, i) => (
                                                    <li key={i}>{reason}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                <Button className="mt-8" onClick={() => window.location.reload()}>Scan Another Package</Button>
                            </div>
                        ) : (
                            <form action={formAction} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="trackingId">Tracking ID (from QR)</Label>
                                    <Input id="trackingId" name="trackingId" placeholder="UUID..." required />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="scannedQuantity">Quantity</Label>
                                        <Input id="scannedQuantity" name="scannedQuantity" type="number" min="0" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="scannedWeightKg">Weight (kg)</Label>
                                        <Input id="scannedWeightKg" name="scannedWeightKg" type="number" step="0.1" min="0" required />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="scannedDimensions">Dimensions (L,W,H)</Label>
                                    <Input id="scannedDimensions" name="scannedDimensions" placeholder="40,30,20" required />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="location">Scan Location</Label>
                                    <Input id="location" name="location" placeholder="e.g. Dock B" />
                                </div>

                                {state.message && !state.success && (
                                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-3 rounded-md">
                                        <AlertTriangle className="w-4 h-4" />
                                        {state.message}
                                    </div>
                                )}

                                <Button type="submit" className="w-full">Verify Scan</Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
