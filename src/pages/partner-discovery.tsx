import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Compass, ExternalLink, MapPin, Search, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { destinations } from '@/lib/discovery-data';

type Provider = 'headout' | 'getyourguide';
const GYG_PARTNER_ID = 'ZSEVDSG';
const HEADOUT_AFFILIATE_CODE = 'JL2D9u';

function loadScript(id: string, src: string, attributes: Record<string, string> = {}) {
  document.getElementById(id)?.remove();
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
  document.body.appendChild(script);
  return () => script.remove();
}

function ProviderWidget({ provider, slug }: { provider: Provider; slug: string }) {
  const destination = destinations.find((item) => item.slug === slug)!;
  useEffect(() => {
    if (provider === 'headout') return;
    return loadScript('gyg-partner-widget', 'https://widget.getyourguide.com/dist/pa.umd.production.min.js', { 'data-gyg-partner-id': GYG_PARTNER_ID });
  }, [provider, slug]);

  if (provider === 'headout') {
    const params = new URLSearchParams({ affiliateCode: HEADOUT_AFFILIATE_CODE, affiliateWebsite: 'https://tours.jagroupservices.co.uk', currencyCode: 'GBP', language: 'en', city: destination.headout!, iframeId: `headout-${destination.slug}`, maxCount: '100', showMore: 'true' });
    return <div className="min-h-80 rounded-2xl border border-border bg-background p-4">
      <iframe key={destination.slug} className="h-[900px] w-full rounded-lg border-0" src={`https://partner.headout.com/embed/gallery/?${params.toString()}`} title={`Headout activities in ${destination.name}`} loading="eager" referrerPolicy="strict-origin-when-cross-origin" allow="payment" />
    </div>;
  }
  const query = `${destination.name}, ${destination.country}`;
  const href = `https://www.getyourguide.com/s/?q=${encodeURIComponent(query)}&partner_id=${GYG_PARTNER_ID}&locale=en-GB&currency=GBP`;
  return (
    <div className="min-h-80 rounded-2xl border border-border bg-background p-4">
      <div data-gyg-href="https://widget.getyourguide.com/default/activities.frame" data-gyg-widget="activities" data-gyg-partner-id={GYG_PARTNER_ID} {...(destination.gyg ? { 'data-gyg-location-id': destination.gyg } : { 'data-gyg-q': query })} data-gyg-locale-code="en-GB" data-gyg-currency="GBP" data-gyg-number-of-items="5" data-gyg-cmp="ja-plan-studio-discovery">
        <span>Powered by <a href={href} target="_blank" rel="sponsored noopener noreferrer">GetYourGuide</a></span>
      </div>
    </div>
  );
}

export function PartnerDiscoveryPage({ provider }: { provider: Provider }) {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const requestedDestination = searchParams.get('destination');
  const [selected, setSelected] = useState<string | null>(() => destinations.some((item) => item.slug === requestedDestination) ? requestedDestination : null);
  const isHeadout = provider === 'headout';
  const available = useMemo(() => destinations.filter((item) => isHeadout ? item.headout : true).filter((item) => `${item.name} ${item.country}`.toLowerCase().includes(query.toLowerCase())), [isHeadout, query]);
  const current = destinations.find((item) => item.slug === selected);

  return <>
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary text-white">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm"><Compass className="h-4 w-4" /> {isHeadout ? 'Primary' : 'Secondary'} affiliate partner</span>
        <h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">Explore activities with {isHeadout ? 'Headout' : 'GetYourGuide'}</h1>
        <p className="mt-5 max-w-2xl text-lg text-white/80">Choose a destination and browse live tours, attractions, tickets and experiences without leaving JA Plan Studio.</p>
      </div>
    </section>
    <section className="bg-background py-14" id="destinations">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Destination gallery</p><h2 className="mt-2 font-heading text-3xl font-bold">{current ? current.name : 'Where would you like to explore?'}</h2></div>
          {current ? <Button variant="outline" onClick={() => setSelected(null)}><ArrowLeft className="h-4 w-4" /> All destinations</Button> : <label className="relative block w-full sm:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" /><input value={query} onChange={(e) => setQuery(e.target.value)} className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3 text-sm" placeholder="Search city or country" /></label>}
        </div>
        {current ? <div className="rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-7"><div className="mb-5"><p className="text-sm text-muted-foreground">Live {isHeadout ? 'Headout' : 'GetYourGuide'} gallery for {current.name}</p></div><ProviderWidget provider={provider} slug={current.slug} /></div> :
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{available.map((item, index) => <button key={item.slug} onClick={() => setSelected(item.slug)} className="group overflow-hidden rounded-2xl border border-border bg-card text-left shadow-sm transition hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"><div className={`h-28 bg-gradient-to-br ${['from-blue-500 to-cyan-400','from-violet-500 to-fuchsia-400','from-amber-500 to-rose-400','from-emerald-500 to-teal-400'][index % 4]} p-5 text-white`}><span className="rounded-full bg-white/20 px-2.5 py-1 text-xs font-bold">{item.code}</span><MapPin className="mt-6 h-6 w-6" /></div><div className="p-5"><h3 className="font-semibold group-hover:text-primary">{item.name}</h3><p className="mt-1 text-sm text-muted-foreground">{item.country}</p><span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open live gallery <ArrowRight className="h-4 w-4" /></span></div></button>)}</div>}
      </div>
    </section>
    <section className="border-t border-border bg-muted/30 py-10"><div className="mx-auto grid max-w-7xl gap-5 px-4 sm:px-6 md:grid-cols-2 lg:px-8"><Card><CardContent className="flex gap-4 p-6"><ShieldCheck className="h-6 w-6 shrink-0 text-primary" /><div><h2 className="font-semibold">Book directly with the provider</h2><p className="mt-1 text-sm text-muted-foreground">Prices, availability, booking terms, cancellations and support are provided by {isHeadout ? 'Headout' : 'GetYourGuide'} or the relevant activity supplier.</p></div></CardContent></Card><Card><CardContent className="flex gap-4 p-6"><ExternalLink className="h-6 w-6 shrink-0 text-primary" /><div><h2 className="font-semibold">Affiliate disclosure</h2><p className="mt-1 text-sm text-muted-foreground">JA Group Services Ltd may receive a commission from qualifying bookings. This does not increase the price you pay.</p></div></CardContent></Card></div></section>
  </>;
}
