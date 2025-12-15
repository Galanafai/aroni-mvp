import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Package, ScanLine, ShieldCheck, Activity, Globe, Lock } from 'lucide-react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getStats() {
  const totalPackages = await prisma.packageMetadata.count();
  const totalScans = await prisma.scanLog.count();
  const recentScans = await prisma.scanLog.findMany({
    take: 5,
    orderBy: { scanTime: 'desc' },
    select: { location: true, result: true, scanTime: true }
  });
  return { totalPackages, totalScans, recentScans };
}

export default async function Home() {
  const stats = await getStats();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 border border-primary/20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographically Secured Supply Chain</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 animate-in fade-in slide-in-from-bottom-6 duration-700">
            Trustless Logistics <br />
            <span className="text-primary">Verifiable Truth</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Aroni anchors every scan to a Merkle Tree, creating an immutable chain of custody for high-value cargo. Don't just track it—prove it.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-200">
            <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/25">
              <Link href="/dashboard">
                Enter Dashboard <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-base bg-background/50 backdrop-blur border-primary/20 hover:bg-primary/5">
              <Link href="/verify">
                Audit a Package
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Live Network Stats */}
      <section className="py-12 border-y border-white/5 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">{stats.totalPackages}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Active Shipments</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-1">{stats.totalScans}</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Immutable Logs</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-white mb-1">100%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-500 mb-1">SHA-256</div>
              <div className="text-sm text-muted-foreground uppercase tracking-wider">Encryption</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Package className="w-10 h-10 text-primary mb-4" />
              <CardTitle>Metadata Anchoring</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Generate cryptographically secure identities for physical goods. Every SKU gets a unique UUID and Merkle leaf.
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
            <CardHeader>
              <ScanLine className="w-10 h-10 text-primary mb-4" />
              <CardTitle>Scan Verification</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Validate goods at every checkpoint. Our system instantly flags mismatches in weight, dimensions, or quantity.
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:border-primary/50 transition-colors">
            <CardHeader>
              <Lock className="w-10 h-10 text-primary mb-4" />
              <CardTitle>Client-Side Proofs</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              "Don't Trust, Verify." Users can audit the integrity of any record directly in their browser using Merkle Proofs.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/10 text-center text-sm text-muted-foreground mt-auto">
        <p>&copy; 2025 Aroni Platform. Built for the Future of Logistics.</p>
      </footer>
    </div>
  );
}
