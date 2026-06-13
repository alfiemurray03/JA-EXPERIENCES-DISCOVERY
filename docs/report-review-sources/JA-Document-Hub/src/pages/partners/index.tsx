import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { useSiteSettings } from '@/lib/site-settings-context';
import {
  Building2, Users, TrendingUp, Award, ArrowRight,
  CheckCircle2, Star, Handshake, Share2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PartnersPage() {
  const { siteName, brandName } = useSiteSettings();

  return (
    <>
      <Helmet>
        <title>Partner Programme — {siteName}</title>
        <meta name="description" content={`Grow your business by partnering with ${siteName}. Join as a Reseller or Affiliate and earn commissions.`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-primary-foreground py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-white/20 text-white border-white/30 hover:bg-white/30">Partner Programme</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Grow Together with {brandName}</h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
            Whether you want to resell our platform to your clients or simply refer people and earn commissions,
            we have a programme built for you.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link to="/reseller/apply">Become a Reseller</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Link to="/affiliate">Affiliate Programme</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Two programme cards */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-3">Choose Your Programme</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Both programmes let you earn by promoting {siteName}. The difference is in how involved you want to be.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Reseller */}
            <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <Building2 className="w-7 h-7 text-primary" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">Reseller</h3>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Managed</Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Sell {siteName} directly to your clients under your own brand. Manage your customer base,
                  track commissions, and access dedicated reseller resources and support.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Dedicated reseller portal',
                    'Manage your own customer base',
                    'Higher commission rates',
                    'Marketing materials & resources',
                    'Dedicated reseller support',
                    'Commission tracking & payouts',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link to="/reseller/apply">
                    Apply to Become a Reseller <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Applications reviewed within 3–5 business days
                </p>
              </CardContent>
            </Card>

            {/* Affiliate */}
            <Card className="border-2 border-accent/20 hover:border-accent/50 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5">
                  <Share2 className="w-7 h-7 text-accent" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-foreground">Affiliate</h3>
                  <Badge className="bg-accent/10 text-accent border-accent/20">Simple</Badge>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Share your unique referral link and earn a commission for every customer who signs up.
                  No client management required — just refer and earn.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {[
                    'Unique referral link & code',
                    'Track clicks and signups',
                    'Commission on conversions',
                    'Simple dashboard',
                    'No client management needed',
                    'Open to everyone',
                  ].map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full border-accent text-accent hover:bg-accent/5">
                  <Link to="/affiliate">
                    Join Affiliate Programme <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Already an affiliate? <Link to="/affiliate/dashboard" className="text-accent hover:underline">Sign in to your dashboard</Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-foreground mb-8">Programme Comparison</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left py-3 px-5 font-semibold text-foreground">Feature</th>
                  <th className="text-center py-3 px-4 font-semibold text-primary">Reseller</th>
                  <th className="text-center py-3 px-4 font-semibold text-accent">Affiliate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ['Application required', '✓', '✓'],
                  ['Dedicated portal', '✓', '—'],
                  ['Manage customers', '✓', '—'],
                  ['Commission on signups', '✓', '✓'],
                  ['Commission on renewals', '✓ (if enabled)', '—'],
                  ['Marketing resources', '✓', '—'],
                  ['Dedicated support', '✓', 'Standard'],
                  ['Commission rate', 'Higher', 'Standard'],
                ].map(([feature, reseller, affiliate]) => (
                  <tr key={feature} className="hover:bg-muted/20">
                    <td className="py-3 px-5 text-foreground">{feature}</td>
                    <td className="py-3 px-4 text-center text-primary font-medium">{reseller}</td>
                    <td className="py-3 px-4 text-center text-accent font-medium">{affiliate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 bg-background text-center">
        <div className="max-w-2xl mx-auto">
          <Handshake className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">Ready to Partner with Us?</h2>
          <p className="text-muted-foreground mb-8">
            Join our growing network of resellers and affiliates. Questions? <Link to="/contact" className="text-primary hover:underline">Contact us</Link>.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/reseller/apply">Apply as Reseller</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/affiliate">Join as Affiliate</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
