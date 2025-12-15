'use client';

import { useState, useActionState } from 'react';
import { submitMetadata, MetadataState } from '@/actions/metadata';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import QRCode from 'react-qr-code';
import Link from 'next/link';
import { ArrowLeft, Printer, CheckCircle } from 'lucide-react';

const initialState: MetadataState = {
    success: false,
};

export default function MetadataFormPage() {
    const [state, formAction, isPending] = useActionState(submitMetadata, initialState);
    const [qrValue, setQrValue] = useState<string | null>(null);

    // Update QR preview when tracking ID is generated
    if (state.success && state.trackingId && qrValue !== state.trackingId) {
        setQrValue(state.trackingId);
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link href="/" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
                    </Link>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Form Section */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Register Package</CardTitle>
                                <CardDescription>Enter cargo details to generate a tracking ID.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {state.success ? (
                                    <div className="text-center py-12">
                                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                                        <h3 className="text-2xl font-bold mb-2">Registration Complete!</h3>
                                        <p className="text-muted-foreground mb-6">
                                            Tracking ID: <span className="font-mono text-foreground">{state.trackingId}</span>
                                        </p>
                                        <Button onClick={() => window.location.reload()}>Register Another Package</Button>
                                    </div>
                                ) : (
                                    <form action={formAction} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sku">SKU</Label>
                                                <Input id="sku" name="sku" placeholder="e.g. ARONI-1001" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hsCode">HS Code</Label>
                                                <Input id="hsCode" name="hsCode" placeholder="e.g. 841810" required />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="quantity">Quantity</Label>
                                                <Input id="quantity" name="quantity" type="number" min="0" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="weightKg">Weight (kg)</Label>
                                                <Input id="weightKg" name="weightKg" type="number" step="0.1" min="0" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="dimensions">Dims (L,W,H)</Label>
                                                <Input id="dimensions" name="dimensions" placeholder="40,30,20" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="packageType">Package Type</Label>
                                            <Select name="packageType" required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="case">Case</SelectItem>
                                                    <SelectItem value="pallet">Pallet</SelectItem>
                                                    <SelectItem value="container">Container</SelectItem>
                                                    <SelectItem value="item">Individual Item</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="sourceId">Source ID</Label>
                                                <Input id="sourceId" name="sourceId" placeholder="Warehouse A" required />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="destinationId">Destination ID</Label>
                                                <Input id="destinationId" name="destinationId" placeholder="Port B" required />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="urgencyLevel">Urgency</Label>
                                            <Select name="urgencyLevel" defaultValue="normal" required>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select urgency" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="priority">Priority</SelectItem>
                                                    <SelectItem value="critical">Critical</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {state.message && !state.success && (
                                            <div className="text-red-500 text-sm">{state.message}</div>
                                        )}

                                        <Button type="submit" className="w-full">Generate QR Code</Button>
                                    </form>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* QR Preview Section */}
                    <div>
                        <Card className="sticky top-8">
                            <CardHeader>
                                <CardTitle>QR Label</CardTitle>
                                <CardDescription>Print this label for the package.</CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center">
                                <div className="bg-white p-4 rounded-lg border shadow-sm mb-4">
                                    {qrValue ? (
                                        <QRCode value={JSON.stringify({ tracking_id: qrValue })} size={150} />
                                    ) : (
                                        <div className="w-[150px] h-[150px] bg-muted flex items-center justify-center text-muted-foreground text-xs text-center p-4">
                                            QR Code will appear here
                                        </div>
                                    )}
                                </div>
                                {qrValue && (
                                    <div className="text-center space-y-4 w-full">
                                        <div className="text-xs font-mono break-all text-muted-foreground">
                                            {qrValue}
                                        </div>
                                        <Button variant="outline" className="w-full" onClick={() => window.print()}>
                                            <Printer className="w-4 h-4 mr-2" /> Print Label
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
