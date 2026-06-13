/**
 * Admin — Referrals
 * View all referral events and top referrers.
 */
import { useState, useEffect } from 'react';
import { Users, Star, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

interface ReferralEvent {
  id: number;
  event_type: string;
  points_awarded: number;
  created_at: string;
  code: string;
  referrer_name: string;
  referrer_email: string;
  referred_name: string;
  referred_email: string;
}

interface TopReferrer {
  id: number;
  name: string;
  email: string;
  total_referrals: number;
  total_points: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminReferrals() {
  const [events, setEvents] = useState<ReferralEvent[]>([]);
  const [topReferrers, setTopReferrers] = useState<TopReferrer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/admin/referrals', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setEvents(d.data.events);
          setTopReferrers(d.data.topReferrers);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = events.filter(e =>
    !search ||
    e.referrer_name.toLowerCase().includes(search.toLowerCase()) ||
    e.referred_name.toLowerCase().includes(search.toLowerCase()) ||
    e.referrer_email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPoints = events.reduce((s, e) => s + e.points_awarded, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Referrals</h1>
        <p className="text-muted-foreground text-sm mt-1">Track referral events and points awarded to customers.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Events', value: events.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Points Awarded', value: totalPoints.toLocaleString(), icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Active Referrers', value: topReferrers.length, icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map(stat => (
          <Card key={stat.label} className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{loading ? '—' : stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top referrers */}
      {!loading && topReferrers.length > 0 && (
        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400" /> Top Referrers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topReferrers.slice(0, 10).map((r, i) => (
                <div key={r.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-5 text-center">#{i + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-xs">{r.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{r.total_referrals} referrals</p>
                    <p className="text-xs text-amber-400">{r.total_points.toLocaleString()} pts</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Events table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" /> All Referral Events
            </CardTitle>
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-xs bg-background border-border text-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
            </div>
          ) : !filtered.length ? (
            <div className="text-center py-10 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">{search ? 'No results match your search.' : 'No referral events yet.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map(ev => (
                <div key={ev.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50 gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="min-w-0">
                      <p className="text-sm text-foreground truncate">
                        <span className="font-medium">{ev.referrer_name}</span>
                        <span className="text-muted-foreground mx-1">→</span>
                        <span className="font-medium">{ev.referred_name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(ev.created_at)}
                        <span className="mx-1">·</span>
                        Code: <span className="font-mono">{ev.code}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="outline" className="text-xs capitalize border-border">
                      {ev.event_type}
                    </Badge>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 font-mono text-xs">
                      +{ev.points_awarded} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
