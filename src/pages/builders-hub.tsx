import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { ArrowRight, Clock3, Compass, MapPinned, Sparkles } from 'lucide-react';
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

const categoryIcon = (category: string) => category.includes('Trips') ? MapPinned : category.includes('Accessible') ? Compass : Sparkles;

export default function BuildersHubPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<BuilderData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { if (!isLoading && !user) navigate('/sign-in?redirect=/builders', { replace: true }); }, [user, isLoading, navigate]);
  useEffect(() => {
    if (!user) return;
    fetch('/account/api/builders', { credentials: 'include' })
      .then(async response => {
        const body = await response.json() as BuilderData;
        if (!response.ok) throw new Error(body.error || 'Experience builders could not be loaded.');
        setData(body);
      })
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Experience builders could not be loaded.'));
  }, [user]);

  const groups = useMemo(() => {
    const map = new Map<string, ExperienceBuilder[]>();
    for (const builder of data?.builders || []) map.set(builder.category, [...(map.get(builder.category) || []), builder]);
    return [...map.entries()];
  }, [data]);

  return <>
    <Helmet><title>Experience Builders — JA Plan Studio</title><meta name="description" content="Build practical plans for days out, occasions, activities, trips and accessible experiences." /></Helmet>
    <DashboardLayout>
      <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">
        <section className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-7 sm:p-9 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-blue-700 text-sm font-semibold mb-3"><Compass className="w-4 h-4" /> Experience planning</div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-950">Build an experience worth looking forward to</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">Choose a guided builder for your day out, occasion, trip or accessible experience. Save your progress and return whenever you like.</p>
          </div>
          {data?.token_summary && <div className="rounded-2xl bg-white border border-slate-200 px-5 py-4 min-w-56"><p className="text-xs uppercase tracking-wide text-slate-500">Your access</p><p className="mt-1 font-semibold text-slate-900">{data.token_summary.plan_name || 'JA Plan Studio'}</p></div>}
        </section>

        {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700">{error}</div>}
        {!data && !error && <div className="grid md:grid-cols-3 gap-5">{[1,2,3,4,5,6].map(i => <div key={i} className="h-48 rounded-2xl bg-slate-100 animate-pulse" />)}</div>}

        {groups.map(([category, builders]) => {
          const Icon = categoryIcon(category);
          return <section key={category}>
            <div className="flex items-center gap-3 mb-5"><div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center"><Icon className="w-5 h-5" /></div><div><h2 className="text-xl font-bold text-slate-950">{category}</h2><p className="text-sm text-slate-500">{builders.length} guided planning {builders.length === 1 ? 'builder' : 'builders'}</p></div></div>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {builders.map(builder => <Link key={builder.id} to={`/builders/${builder.id}`} className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-950/5 transition-all flex flex-col min-h-52">
                <div className="flex items-start justify-between"><span className="text-2xl" aria-hidden>{builder.icon || '✨'}</span>{builder.featured ? <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold">Popular</span> : null}</div>
                <h3 className="mt-5 text-lg font-bold text-slate-950 group-hover:text-blue-700">{builder.name}</h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed flex-1">{builder.description}</p>
                <div className="mt-5 flex items-center justify-between text-sm"><span className="text-slate-500 flex items-center gap-1.5"><Clock3 className="w-4 h-4" /> About {builder.estimated_minutes || 10} min</span><span className="text-blue-700 font-semibold flex items-center gap-1">Start planning <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></span></div>
              </Link>)}
            </div>
          </section>;
        })}

        {(data?.drafts?.length || 0) > 0 && <section><h2 className="text-xl font-bold text-slate-950 mb-4">Continue planning</h2><div className="grid md:grid-cols-2 gap-4">{data!.drafts.slice(0,4).map(draft => <Link key={draft.id} to={`/builders/${draft.builder_id}`} className="rounded-2xl border border-slate-200 bg-white p-5 flex items-center justify-between hover:border-blue-300"><div><p className="font-semibold text-slate-900">{draft.builder_name}</p><p className="text-sm text-slate-500 mt-1">Draft saved {new Date(draft.last_saved_at).toLocaleDateString('en-GB')}</p></div><ArrowRight className="w-5 h-5 text-blue-600" /></Link>)}</div></section>}
      </main>
    </DashboardLayout>
  </>;
}
