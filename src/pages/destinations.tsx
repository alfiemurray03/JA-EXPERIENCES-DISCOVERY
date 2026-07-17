import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Compass, MapPin, Search } from 'lucide-react';
import { destinations } from '@/lib/discovery-data';

export default function DestinationsPage() {
  const [query, setQuery] = useState('');
  const [country, setCountry] = useState('All');
  const countries = ['All', ...Array.from(new Set(destinations.map((item) => item.country)))];
  const filtered = useMemo(() => destinations.filter((item) => (country === 'All' || item.country === country) && `${item.name} ${item.country}`.toLowerCase().includes(query.toLowerCase())), [query, country]);

  return <>
    <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary text-white"><div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20"><span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm"><Compass className="h-4 w-4" /> Destination discovery</span><h1 className="mt-5 max-w-3xl font-heading text-4xl font-bold tracking-tight sm:text-5xl">Find somewhere worth planning</h1><p className="mt-5 max-w-2xl text-lg text-white/80">Explore city, island and regional ideas, compare partner activities and turn your favourites into a personalised plan.</p></div></section>
    <section className="bg-background py-14"><div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6"><label className="relative block"><Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} className="h-12 w-full rounded-xl border border-input bg-background pl-12 pr-4" placeholder="Search destinations or countries" /></label><div className="mt-4 flex gap-2 overflow-x-auto pb-2">{countries.map((item) => <button key={item} onClick={() => setCountry(item)} className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${country === item ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{item}</button>)}</div></div>
      <div className="mt-8"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Destination gallery</p><h2 className="mt-2 font-heading text-3xl font-bold">Explore {filtered.length} destinations</h2></div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{filtered.map((item, index) => <article key={item.slug} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-lg"><div className={`h-36 bg-gradient-to-br ${['from-blue-600 via-blue-500 to-cyan-400','from-violet-600 via-purple-500 to-fuchsia-400','from-orange-500 via-amber-500 to-yellow-300','from-emerald-600 via-teal-500 to-cyan-400'][index % 4]} p-5 text-white`}><div className="flex items-center justify-between"><span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">{item.country}</span><span className="text-sm font-bold">{item.code}</span></div><MapPin className="mt-10 h-7 w-7" /></div><div className="p-5"><h3 className="text-lg font-semibold group-hover:text-primary">{item.name}</h3><p className="mt-2 text-sm text-muted-foreground">Browse activities and shape your itinerary, budget and practical plans.</p><div className="mt-5 flex gap-4"><Link className="inline-flex items-center gap-1 text-sm font-semibold text-primary" to={`/destinations/${item.slug}`}>View guide <ArrowRight className="h-4 w-4" /></Link><Link className="text-sm font-semibold text-muted-foreground hover:text-primary" to={`/headout?destination=${item.slug}`}>Activities</Link></div></div></article>)}</div>
      {!filtered.length && <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">No destinations match that search yet.</div>}
    </div></section>
  </>;
}
