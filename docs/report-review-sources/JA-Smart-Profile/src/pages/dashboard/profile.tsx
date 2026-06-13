import { useState, useEffect, useRef } from 'react';
import { ExternalLink, Camera, Save, Check, MessageCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { useBranding } from '@/lib/branding';

// ─── Feature toggles sub-component ───────────────────────────────────────────

function ProfileFeatureToggles({ profileId }: { profileId: number }) {
  const [messagingEnabled, setMessagingEnabled] = useState<boolean | null>(null);
  const [enquiryEnabled, setEnquiryEnabled] = useState<boolean | null>(null);
  const [togglingMsg, setTogglingMsg] = useState(false);
  const [togglingEnq, setTogglingEnq] = useState(false);

  useEffect(() => {
    fetch(`/api/profiles/${profileId}/pin/status`, { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setMessagingEnabled(!!d.data.messaging_enabled);
          setEnquiryEnabled(!!d.data.enquiry_enabled);
        }
      });
  }, [profileId]);
  const toggleMessaging = async (enabled: boolean) => {
    setTogglingMsg(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/messaging`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) setMessagingEnabled(!!data.messaging_enabled);
    } finally { setTogglingMsg(false); }
  };

  const toggleEnquiry = async (enabled: boolean) => {
    setTogglingEnq(true);
    try {
      const res = await fetch(`/api/profiles/${profileId}/enquiry`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) setEnquiryEnabled(!!data.enquiry_enabled);
    } finally { setTogglingEnq(false); }
  };

  if (messagingEnabled === null) return null;

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle className="text-base">Features on Your Card</CardTitle>
        <CardDescription>Control which interactive features appear on your public profile</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Direct Messaging</p>
              <p className="text-xs text-muted-foreground">Allow visitors to send you messages from your card</p>
            </div>
          </div>
          <Switch
            checked={messagingEnabled ?? false}
            onCheckedChange={toggleMessaging}
            disabled={togglingMsg}
          />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Contact Enquiry Form</p>
              <p className="text-xs text-muted-foreground">Show a contact form on your public card</p>
            </div>
          </div>
          <Switch
            checked={enquiryEnabled ?? false}
            onCheckedChange={toggleEnquiry}
            disabled={togglingEnq}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface Profile {
  id: number; username: string; display_name: string; job_title: string; company: string;
  bio: string; phone: string; email: string; website: string; address: string;
  profile_photo: string; is_published: number;
  show_phone: number; show_email: number; show_website: number; show_address: number; show_bio: number;
  theme_id: number;
  profile_type: string; url_prefix: string;
  biz_slug: string | null; person_slug: string | null;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const branding = useBranding();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: '', display_name: '', job_title: '', company: '', bio: '',
    phone: '', email: '', website: '', address: '', profile_photo: '',
    is_published: 1, show_phone: 1, show_email: 1, show_website: 1, show_address: 1, show_bio: 1,
  });

  useEffect(() => {
    fetch('/api/profiles/me', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data.length > 0) {
          const p = d.data[0];
          setProfile(p);
          setForm({
            username: p.username || '',
            display_name: p.display_name || '',
            job_title: p.job_title || '',
            company: p.company || '',
            bio: p.bio || '',
            phone: p.phone || '',
            email: p.email || '',
            website: p.website || '',
            address: p.address || '',
            profile_photo: p.profile_photo || '',
            is_published: p.is_published,
            show_phone: p.show_phone,
            show_email: p.show_email,
            show_website: p.show_website,
            show_address: p.show_address,
            show_bio: p.show_bio,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return setError('Photo must be under 2MB');
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, profile_photo: ev.target?.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const url = profile ? `/api/profiles/${profile.id}` : '/api/profiles';
      const method = profile ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      setProfile(data.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 pb-20 lg:pb-0">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 w-full rounded-2xl" />)}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 lg:pb-0">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-muted-foreground mt-1">Edit your public profile details</p>
        </div>
        <div className="flex gap-2">
        {profile && (
            <a
              href={profile.profile_type === 'business' && profile.biz_slug && profile.person_slug
                ? `/${profile.biz_slug}/${profile.person_slug}`
                : `/${profile.url_prefix || 'F'}/${profile.username}`}
              target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="border-border gap-2">
                <ExternalLink className="w-4 h-4" /> Preview
              </Button>
            </a>
          )}
          <Button onClick={handleSave} disabled={saving} className="bg-primary gap-2">
            {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save</>}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">{error}</div>
      )}

      {/* Photo */}
      <Card className="bg-card border-border mb-6">
        <CardHeader><CardTitle className="text-base">Profile Photo</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              {form.profile_photo ? (
                <img src={form.profile_photo} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-border">
                  <span className="text-primary font-bold text-2xl">{(form.display_name || user?.name || 'U').charAt(0)}</span>
                </div>
              )}
              <button onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
            <div>
              <p className="text-sm text-foreground font-medium">Upload photo or logo</p>
              <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
              <button onClick={() => fileRef.current?.click()} className="text-xs text-primary hover:underline mt-1">Choose file</button>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
          </div>
        </CardContent>
      </Card>

      {/* Basic Info */}
      <Card className="bg-card border-border mb-6">
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
          <CardDescription>
            Your public profile URL:{' '}
            <span className="text-primary font-mono text-xs">
              {new URL(branding.platform_url).hostname}/
              {profile?.profile_type === 'business' && profile.biz_slug && profile.person_slug
                ? `${profile.biz_slug}/${profile.person_slug}`
                : `${profile?.url_prefix || 'F'}/${form.username}`}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Username (your profile URL)</Label>
            <div className="flex mt-1.5">
              <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-border bg-muted text-muted-foreground text-sm">
                {new URL(branding.platform_url).hostname}/{profile?.url_prefix || 'F'}/
              </span>
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                className="rounded-l-none bg-background border-border" placeholder="yourname" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Display Name</Label>
              <Input value={form.display_name} onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                className="mt-1.5 bg-background border-border" placeholder="Alex Johnson" />
            </div>
            <div>
              <Label>Job Title</Label>
              <Input value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                className="mt-1.5 bg-background border-border" placeholder="Product Designer" />
            </div>
          </div>
          <div>
            <Label>Company</Label>
            <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
              className="mt-1.5 bg-background border-border" placeholder="Creative Studio" />
          </div>
          <div>
            <Label>Bio</Label>
            <Textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
              className="mt-1.5 bg-background border-border resize-none" rows={3}
              placeholder="Tell people about yourself..." />
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-card border-border mb-6">
        <CardHeader><CardTitle className="text-base">Contact Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'phone', label: 'Phone', placeholder: '+44 7700 900123', showKey: 'show_phone' },
            { key: 'email', label: 'Email', placeholder: 'you@example.com', showKey: 'show_email' },
            { key: 'website', label: 'Website', placeholder: 'https://yourwebsite.com', showKey: 'show_website' },
            { key: 'address', label: 'Address', placeholder: 'London, UK', showKey: 'show_address' },
          ].map(field => (
            <div key={field.key} className="flex items-center gap-3">
              <div className="flex-1">
                <Label>{field.label}</Label>
                <Input value={form[field.key as keyof typeof form] as string}
                  onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                  className="mt-1.5 bg-background border-border" placeholder={field.placeholder} />
              </div>
              <div className="flex flex-col items-center gap-1 pt-6">
                <Switch
                  checked={!!form[field.showKey as keyof typeof form]}
                  onCheckedChange={v => setForm(f => ({ ...f, [field.showKey]: v ? 1 : 0 }))}
                />
                <span className="text-xs text-muted-foreground">Show</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Visibility */}
      <Card className="bg-card border-border mb-6">
        <CardHeader><CardTitle className="text-base">Visibility Settings</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Published</p>
              <p className="text-xs text-muted-foreground">Make your profile visible to the public</p>
            </div>
            <Switch checked={!!form.is_published} onCheckedChange={v => setForm(f => ({ ...f, is_published: v ? 1 : 0 }))} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Show Bio</p>
              <p className="text-xs text-muted-foreground">Display your bio on your public profile</p>
            </div>
            <Switch checked={!!form.show_bio} onCheckedChange={v => setForm(f => ({ ...f, show_bio: v ? 1 : 0 }))} />
          </div>
        </CardContent>
      </Card>

      {/* Feature toggles — saved separately via PATCH, not part of the main profile save */}
      {profile && <ProfileFeatureToggles profileId={profile.id} />}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="bg-primary gap-2">
          {saved ? <><Check className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
        </Button>
      </div>
    </div>
  );
}
