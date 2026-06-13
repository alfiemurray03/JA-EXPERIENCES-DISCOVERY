/**
 * Builders Hub — /builders
 *
 * Displays all 10 document builders. Builder metadata (name, description,
 * template counts) is fetched from /api/builders/summary which merges the
 * static code defaults with any DB overrides saved via the Admin Portal.
 * Nothing on this page is hardcoded — all content is driven by the API.
 */
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/lib/auth-context';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Mail, Receipt, FileSignature, Shield, ClipboardList,
  BarChart2, Users, Briefcase, CheckSquare, PenLine,
  ChevronRight, Zap, AlertTriangle,
} from 'lucide-react';

// Icon map — keyed by builder id
const BUILDER_ICONS: Record<string, React.ElementType> = {
  letter:    PenLine,
  email:     Mail,
  invoice:   Receipt,
  contract:  FileSignature,
  policy:    Shield,
  form:      ClipboardList,
  report:    BarChart2,
  minutes:   Users,
  proposal:  Briefcase,
  checklist: CheckSquare,
};

interface BuilderSummary {
  id: string;
  label: string;
  description: string;
  href: string;
  accentColor: string;
  activeCount: number;
  popularCount: number;
}

export default function BuildersHubPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  const [builders, setBuilders] = useState<BuilderSummary[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  // Auth guard
  useEffect(() => {
    if (!isLoading && !user) navigate('/login?redirect=/builders', { replace: true });
  }, [user, isLoading, navigate]);

  // Fetch live builder summary from API
  useEffect(() => {
    if (!user) return;
    setFetching(true);
    fetch('/api/builders/summary', { credentials: 'include' })
      .then(r => r.json() as Promise<{ success: boolean; builders?: BuilderSummary[]; error?: string }>)
      .then(data => {
        if (data.success && data.builders) {
          setBuilders(data.builders);
        } else {
          setError(data.error ?? 'Failed to load builders.');
        }
      })
      .catch(() => setError('Network error loading builders.'))
      .finally(() => setFetching(false));
  }, [user]);

  const totalActive = builders.reduce((s, b) => s + b.activeCount, 0);

  return (
    <>
      <Helmet>
        <title>Document Builders — JA Document Hub</title>
        <meta
          name="description"
          content="Choose from 10 professional document builders — letters, invoices, contracts, policies, forms, reports, and more."
        />
      </Helmet>
      <DashboardLayout>
        <div className="p-6 max-w-7xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-foreground">Document Builders</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {fetching
                ? 'Loading builders…'
                : `${builders.length} builders · ${totalActive} active templates`
              }
            </p>
          </div>

          {/* Error state */}
          {error && (
            <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Loading skeleton */}
          {fetching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="p-5 rounded-2xl border border-border bg-card space-y-3">
                  <div className="flex items-start gap-3">
                    <Skeleton className="w-11 h-11 rounded-xl shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-24" />
                </div>
              ))}
            </div>
          )}

          {/* Builder grid */}
          {!fetching && builders.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {builders.map((b) => {
                const Icon = BUILDER_ICONS[b.id] ?? PenLine;
                const bg = b.accentColor + '18';

                return (
                  <Link
                    key={b.id}
                    to={b.href}
                    className="group flex flex-col gap-4 p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all"
                  >
                    {/* Icon + title row */}
                    <div className="flex items-start gap-3">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                        style={{ background: bg }}
                      >
                        <Icon className="w-5 h-5" style={{ color: b.accentColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                            {b.label}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-4 px-1.5 shrink-0">
                            {b.activeCount} template{b.activeCount !== 1 ? 's' : ''}
                          </Badge>
                          {b.popularCount > 0 && (
                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5 gap-0.5 shrink-0">
                              <Zap className="w-2.5 h-2.5" />
                              {b.popularCount} popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                          {b.description}
                        </p>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center justify-end">
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

        </div>
      </DashboardLayout>
    </>
  );
}
