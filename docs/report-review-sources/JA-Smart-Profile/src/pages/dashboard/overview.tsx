import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, MousePointerClick, Mail, Link2, ArrowRight, ExternalLink, User, Plus, Star, Gift, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

interface Profile { id: number; username: string; display_name: string; is_published: number; }
interface Enquiry { id: number; sender_name: string; sender_email: string; message: string; created_at: string; is_read: number; profile_name: string; }
interface Analytics { totalViews: number; recentViews: number; totalClicks: number; recentClicks: number; }
interface PointsSummary { balance: number; earned: number; redeemed: number; referralCount: number; }

export default function OverviewPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [linkCount, setLinkCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [points, setPoints] = useState<PointsSummary | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [profilesRes, enquiriesRes, pointsRes] = await Promise.all([
          fetch('/api/profiles/me', { credentials: 'include' }),
          fetch('/api/enquiries', { credentials: 'include' }),
          fetch('/api/points/summary', { credentials: 'include' }),
        ]);
        const profilesData = await profilesRes.json();
        const enquiriesData = await enquiriesRes.json();
        const pointsData = await pointsRes.json();

        if (profilesData.success && profilesData.data.length > 0) {
          const p = profilesData.data[0];
          setProfile(p);

          const [analyticsRes, linksRes] = await Promise.all([
            fetch(`/api/analytics/${p.id}`, { credentials: 'include' }),
            fetch(`/api/links/${p.id}`, { credentials: 'include' }),
          ]);
          const analyticsData = await analyticsRes.json();
          const linksData = await linksRes.json();
          if (analyticsData.success) setAnalytics(analyticsData.data);
          if (linksData.success) setLinkCount(linksData.data.filter((l: { is_enabled: number }) => l.is_enabled).length);
        }
        if (enquiriesData.success) setEnquiries(enquiriesData.data.slice(0, 3));
        if (pointsData.success) setPoints(pointsData.data);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  const unreadCount = enquiries.filter(e => !e.is_read).length;

  const stats = [
    { label: 'Total Views', value: analytics?.totalViews ?? 0, sub: `+${analytics?.recentViews ?? 0} this month`, icon: Eye, color: 'text-blue-400' },
    { label: 'Link Clicks', value: analytics?.totalClicks ?? 0, sub: `+${analytics?.recentClicks ?? 0} this month`, icon: MousePointerClick, color: 'text-green-400' },
    { label: 'Enquiries', value: enquiries.length, sub: `${unreadCount} unread`, icon: Mail, color: 'text-orange-400' },
    { label: 'Active Links', value: linkCount, sub: 'enabled links', icon: Link2, color: 'text-purple-400' },
  ];

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-0">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Welcome back, {user?.name?.split(' ')[0]} 👋</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening with your profile.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, i) => (
          <Card key={i} className="bg-card border-border">
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-12" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Points & Rewards summary widget */}
      <Card className="bg-card border-border mb-6">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Star className="w-4 h-4 text-primary" /> Points & Rewards
          </CardTitle>
          <Link to="/dashboard/points" className="text-xs text-primary hover:underline flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Balance', value: (points?.balance ?? 0).toLocaleString(), icon: Star, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Lifetime Earned', value: (points?.earned ?? 0).toLocaleString(), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
                { label: 'Redeemed', value: (points?.redeemed ?? 0).toLocaleString(), icon: Gift, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Referrals', value: (points?.referralCount ?? 0).toLocaleString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className={`rounded-xl p-3 ${bg} flex items-center gap-3`}>
                  <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
                  <div>
                    <p className="text-lg font-bold text-foreground leading-none">{value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/dashboard/profile">
              <Button variant="outline" className="w-full justify-start gap-2 border-border hover:bg-muted">
                <User className="w-4 h-4" /> Edit Profile
              </Button>
            </Link>
            <Link to="/dashboard/links">
              <Button variant="outline" className="w-full justify-start gap-2 border-border hover:bg-muted">
                <Plus className="w-4 h-4" /> Add Link
              </Button>
            </Link>
            {profile && (
              <a href={`/${profile.username}`} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full justify-start gap-2 border-border hover:bg-muted">
                  <ExternalLink className="w-4 h-4" /> View Public Page
                </Button>
              </a>
            )}
          </CardContent>
        </Card>

        {/* Profile card */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ) : profile ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-primary font-bold">{(profile.display_name || 'U').charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{profile.display_name || 'No name set'}</p>
                    <p className="text-xs text-muted-foreground">/{profile.username}</p>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${profile.is_published ? 'bg-green-500/10 text-green-400' : 'bg-muted text-muted-foreground'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${profile.is_published ? 'bg-green-400' : 'bg-muted-foreground'}`} />
                  {profile.is_published ? 'Published' : 'Draft'}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground text-sm mb-3">No profile yet</p>
                <Link to="/dashboard/profile">
                  <Button size="sm" className="bg-primary">Create Profile</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Enquiries */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Recent Enquiries</CardTitle>
            <Link to="/dashboard/enquiries" className="text-xs text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full" />)}
              </div>
            ) : enquiries.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-4">No enquiries yet</p>
            ) : (
              <div className="space-y-3">
                {enquiries.map(e => (
                  <div key={e.id} className={`p-3 rounded-lg border ${e.is_read ? 'border-border bg-muted/30' : 'border-primary/20 bg-primary/5'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-foreground">{e.sender_name}</p>
                      {!e.is_read && <span className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{e.message}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
