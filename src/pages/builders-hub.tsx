import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowRight, Clock3, Compass, Search } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';

export interface ExperienceBuilder {
  id: string; name: string; category: string; description: string; icon?: string;
  estimated_minutes?: number; featured?: number; form_schema?: string; token_cost?: number;
}

export interface BuilderCreditSummary {
  usage_model?: 'credits' | 'unlimited'; unlimited_builder_use?: boolean;
  remaining_tokens?: number; used_tokens?: number; credit_limit?: number | null;
  five_hour_limit?: number | null; used_last_five_hours?: number;
  five_hour_resets_at?: string; token_reset_at?: string; plan_name?: string;
  plan_active?: boolean; trial_active?: boolean;
}

interface BuilderData {
  builders: ExperienceBuilder[];
  drafts: Array<{ id: string; builder_id: string; builder_name: string; last_saved_at: string }>;
  outputs: Array<{ id: string; builder_id: string; title: string; created_at: string }>;
  token_summary?: BuilderCreditSummary;
  error?: string;
}

export default function BuildersHubPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<BuilderData | null>(null);
  const [error, setError] = useState('');
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [preview, setPreview] = useState<ExperienceBuilder | null>(null);

  useEffect(() => { if (!isLoading && !user) navigate('/sign-in?redirect=/builders', { replace: true }); }, [user, isLoading, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch('/account/api/builders', { credentials: 'include' })
      .then(async response => {
        const contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) throw new Error('The builder service returned an invalid response. Please refresh and try again.');
        const body = await response.json() as BuilderData;
        if (!response.ok) throw new Error(body.error || 'Experience builders could not be loaded.');
        setData(body);
        const firstCategory = body.builders[0]?.category || '';
        setCategory(current => current || firstCategory);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Experience builders could not be loaded.'));
  }, [user]);

  const categories = useMemo(() => [...new Set((data?.builders || []).map(builder => builder.category))], [data]);
  const visibleBuilders = useMemo(() => (data?.builders || []).filter(builder =>
    (!category || builder.category === category) && `${builder.name} ${builder.description}`.toLowerCase().includes(query.toLowerCase())
  ), [data, category, query]);

  return <>
    <Helmet><title>Experience Builders — JA Plan Studio</title><meta name="description" content="Build practical plans for days out, occasions, activities, trips and accessible experiences." /></Helmet>
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-blue-700 text-sm font-semibold mb-3"><Compass className="w-4 h-4" /> Experience planning</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Professional experience builder studio</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">Choose an audience and category, explore hundreds of guided templates, preview the questions and then build a practical plan.</p>
          </div>
          {data?.token_summary && <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 min-w-56"><p className="text-xs uppercase tracking-wide text-slate-500">Your access</p><p className="mt-1 font-semibold text-slate-900">{data.token_summary.plan_name || 'JA Plan Studio'}</p></div>}
        </section>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
        {!data && !error && <div className="grid md:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />)}</div>}

        {data && <section className="grid lg:grid-cols-[250px_minmax(0,1fr)_320px] gap-5 items-start">
          <aside className="rounded-2xl border border-slate-200 bg-white p-3 lg:sticky lg:top-24">
            <p className="px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500">Categories</p>
            {categories.map(item => <button key={item} type="button" onClick={() => { setCategory(item); setPreview(null); }} className={`w-full rounded-xl px-3 py-3 text-left text-sm font-semibold ${category === item ? 'bg-blue-600 text-white' : 'bg-white text-slate-800 hover:bg-slate-100'}`}><span className="block">{item}</span><span className={`mt-1 block text-xs ${category === item ? 'text-blue-100' : 'text-slate-500'}`}>{data.builders.filter(builder => builder.category === item).length} templates</span></button>)}
          </aside>
          <div className="min-w-0 space-y-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search this category…" className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-slate-950" /></div>
            <div><h2 className="text-xl font-bold text-slate-950">{category}</h2><p className="text-sm text-slate-500">{visibleBuilders.length} professional templates</p></div>
            <div className="grid sm:grid-cols-2 gap-4">{visibleBuilders.map(builder => <button type="button" key={builder.id} onClick={() => setPreview(builder)} className={`rounded-2xl border bg-white p-5 text-left text-slate-950 transition-all hover:border-blue-400 hover:shadow-md ${preview?.id === builder.id ? 'border-blue-600 ring-2 ring-blue-100' : 'border-slate-200'}`}><div className="flex justify-between"><span className="text-2xl">{builder.icon || '✨'}</span><span className="text-xs text-slate-500 flex items-center gap-1"><Clock3 className="h-3.5 w-3.5"/>{builder.estimated_minutes || 10} min</span></div><h3 className="mt-4 font-bold text-slate-950">{builder.name}</h3><p className="mt-2 line-clamp-3 text-sm text-slate-600">{builder.description}</p><span className="mt-4 inline-flex text-sm font-semibold text-blue-700">Preview template</span></button>)}</div>
          </div>
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 text-slate-950">
            {preview ? <><div className="text-3xl">{preview.icon || '✨'}</div><p className="mt-4 text-xs font-bold uppercase tracking-wide text-blue-700">Template preview</p><h2 className="mt-1 text-xl font-bold text-slate-950">{preview.name}</h2><p className="mt-3 text-sm leading-relaxed text-slate-600">{preview.description}</p><div className="mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700"><p className="font-semibold text-slate-900">This builder covers</p><ul className="mt-2 space-y-1"><li>• Priorities and preferences</li><li>• Timings and practical planning</li><li>• Budget and accessibility needs</li><li>• Contingencies and next steps</li></ul></div><Link to={`/builders/${preview.id}`} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Open builder <ArrowRight className="h-4 w-4"/></Link></> : <div className="py-12 text-center"><Compass className="mx-auto h-9 w-9 text-blue-600"/><h2 className="mt-4 font-bold text-slate-950">Select a template</h2><p className="mt-2 text-sm text-slate-500">Choose a builder from the gallery to preview it here before starting.</p></div>}
          </aside>
        </section>}

        {(data?.drafts?.length || 0) > 0 && <section><h2 className="text-xl font-bold text-slate-950 mb-4">Continue planning</h2><div className="grid md:grid-cols-2 gap-4">{data!.drafts.slice(0,4).map(draft => <Link key={draft.id} to={`/builders/${draft.builder_id}`} className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between hover:border-blue-300"><div><p className="font-semibold text-slate-900">{draft.builder_name}</p><p className="text-sm text-slate-500 mt-1">Draft saved {new Date(draft.last_saved_at).toLocaleDateString('en-GB')}</p></div><ArrowRight className="w-5 h-5 text-blue-600" /></Link>)}</div></section>}
      </main>
    </DashboardLayout>
  </>;
}
