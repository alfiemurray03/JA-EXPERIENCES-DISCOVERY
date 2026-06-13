import { useState, useEffect } from 'react';
import { Eye, MousePointerClick, TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

interface Analytics {
  totalViews: number; recentViews: number; totalClicks: number; recentClicks: number;
  viewsByDay: { date: string; count: number }[];
  topLinks: { label: string; url: string; platform: string | null; clicks: number }[];
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ id: number } | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<{ has_advanced_analytics: number; name: string } | null>(null);

  useEffect(() => {
    async function load() {
      const [profilesRes, plansRes] = await Promise.all([
        fetch('/api/profiles/me', { credentials: 'include' }),
        fetch('/api/plans'),
      ]);
      const profilesData = await profilesRes.json();
      const plansData = await plansRes.json();
      if (plansData.success) {
        const userPlan = plansData.data.find((p: { id: number }) => p.id === user?.plan_id);
        setPlan(userPlan);
      }
      if (profilesData.success && profilesData.data.length > 0) {
        setProfile(profilesData.data[0]);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!profile) return;
    setLoading(true);
    fetch(`/api/analytics/${profile.id}?days=${days}`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setAnalytics(d.data); })
      .finally(() => setLoading(false));
  }, [profile, days]);

  const maxViews = analytics?.viewsByDay.reduce((m, d) => Math.max(m, d.count), 0) || 1;

  return (
    <div className="max-w-3xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground mt-1">Track your profile performance</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <Button key={d} size="sm" variant={days === d ? 'default' : 'outline'}
              onClick={() => setDays(d)}
              className={days === d ? 'bg-primary' : 'border-border'}>
              {d}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {[
          { label: `Views (${days}d)`, value: analytics?.recentViews ?? 0, total: analytics?.totalViews ?? 0, icon: Eye, color: 'text-blue-400' },
          { label: `Clicks (${days}d)`, value: analytics?.recentClicks ?? 0, total: analytics?.totalClicks ?? 0, icon: MousePointerClick, color: 'text-green-400' },
        ].map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              {loading ? <Skeleton className="h-16 w-full" /> : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.total} total all time</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> Page Views Over Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-40 w-full" /> : analytics?.viewsByDay.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-muted-foreground text-sm">No data for this period</div>
          ) : (
            <div className="flex items-end gap-1 h-40">
              {analytics?.viewsByDay.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative w-full">
                    <div
                      className="w-full bg-primary/20 hover:bg-primary/40 rounded-t transition-all"
                      style={{ height: `${Math.max(4, (d.count / maxViews) * 120)}px` }}
                    />
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-card border border-border rounded px-1.5 py-0.5 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {d.count} views
                    </div>
                  </div>
                  {analytics.viewsByDay.length <= 14 && (
                    <span className="text-xs text-muted-foreground">{new Date(d.date).getDate()}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Links */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" /> Top Links by Clicks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <Skeleton className="h-32 w-full" /> : !analytics?.topLinks.length ? (
            <p className="text-muted-foreground text-sm text-center py-4">No link clicks yet</p>
          ) : (
            <div className="space-y-3">
              {analytics.topLinks.map((link, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground truncate">{link.label}</p>
                    <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(link.clicks / (analytics.topLinks[0]?.clicks || 1)) * 100}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground flex-shrink-0">{link.clicks}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!plan?.has_advanced_analytics && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4 flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Advanced analytics on Professional+</p>
              <p className="text-xs text-muted-foreground">Upgrade for detailed visitor insights, geographic data, and more.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
