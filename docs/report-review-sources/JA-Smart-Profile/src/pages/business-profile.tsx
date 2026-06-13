/**
 * Public Business Profile Page
 * Route: /:bizSlug/:personSlug
 * e.g.  /Smith-Design-Studio/Jane-Smith
 */
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  Phone, Mail, Globe, MapPin, Search, Clock, Users, Briefcase,
  Linkedin, Twitter, Instagram, Facebook, Youtube, Github,
  ChevronDown, ChevronUp, Share2, X, Megaphone, Building2,
  MessageCircle, Send, CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useBranding } from '@/lib/branding';

// ─── Types ────────────────────────────────────────────────────────────────

interface Service {
  name: string;
  description?: string;
  price?: string;
  category?: string;
}

interface TeamMember {
  name: string;
  role?: string;
  bio?: string;
  photo?: string;
  email?: string;
  linkedin?: string;
}

interface Announcement {
  title: string;
  body?: string;
  date?: string;
  tag?: string;
}

interface ProfileLink {
  id: number; type: string; platform: string | null; label: string; url: string; icon: string | null;
}

interface BusinessProfile {
  id: number;
  profile_type: 'business';
  biz_slug: string;
  person_slug: string;
  business_name: string;
  display_name: string;
  business_description: string;
  business_category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  profile_photo: string | null;
  logo_url: string | null;
  cover_url: string | null;
  opening_hours: string | null;
  services: Service[];
  team_members: TeamMember[];
  announcements: Announcement[];
  links: ProfileLink[];
  plan: { has_contact_form: number; remove_branding: number };
}

// ─── Platform icons ───────────────────────────────────────────────────────

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  linkedin: Linkedin, twitter: Twitter, instagram: Instagram,
  facebook: Facebook, youtube: Youtube, github: Github,
};

function PlatformIcon({ platform, className }: { platform: string | null; className?: string }) {
  if (platform && PLATFORM_ICONS[platform]) {
    const Icon = PLATFORM_ICONS[platform];
    return <Icon className={className} />;
  }
  return <Globe className={className} />;
}

// ─── Search highlight helper ──────────────────────────────────────────────

function Highlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === query.toLowerCase()
          ? <mark key={i} className="bg-yellow-400/30 text-foreground rounded px-0.5">{p}</mark>
          : p
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────

export default function BusinessProfilePage() {
  const { bizSlug, personSlug } = useParams<{ bizSlug: string; personSlug: string }>();
  const branding = useBranding();

  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Sections expand/collapse
  const [expandedSection, setExpandedSection] = useState<string | null>('services');

  // Contact form
  const [contactForm, setContactForm] = useState({ sender_name: '', sender_email: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (!bizSlug || !personSlug) return;
    fetch(`/api/business/${bizSlug}/${personSlug}/public`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(d => {
        if (d.success) setProfile(d.data);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [bizSlug, personSlug]);

  // ── Search results ──────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!profile || !searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();

    const results: { section: string; label: string; text: string }[] = [];

    // Business info
    if (profile.business_description?.toLowerCase().includes(q)) {
      results.push({ section: 'About', label: 'Business Description', text: profile.business_description });
    }
    if (profile.business_category?.toLowerCase().includes(q)) {
      results.push({ section: 'About', label: 'Category', text: profile.business_category });
    }

    // Services
    profile.services.forEach(s => {
      if (s.name.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q) || s.category?.toLowerCase().includes(q)) {
        results.push({ section: 'Services', label: s.name, text: s.description || s.category || '' });
      }
    });

    // Team
    profile.team_members.forEach(m => {
      if (m.name.toLowerCase().includes(q) || m.role?.toLowerCase().includes(q) || m.bio?.toLowerCase().includes(q)) {
        results.push({ section: 'Team', label: m.name, text: m.role || m.bio || '' });
      }
    });

    // Contact
    if (profile.phone?.toLowerCase().includes(q)) results.push({ section: 'Contact', label: 'Phone', text: profile.phone });
    if (profile.email?.toLowerCase().includes(q)) results.push({ section: 'Contact', label: 'Email', text: profile.email });
    if (profile.address?.toLowerCase().includes(q)) results.push({ section: 'Contact', label: 'Address', text: profile.address });

    // Announcements
    profile.announcements.forEach(a => {
      if (a.title.toLowerCase().includes(q) || a.body?.toLowerCase().includes(q)) {
        results.push({ section: 'Updates', label: a.title, text: a.body || '' });
      }
    });

    return results;
  }, [profile, searchQuery]);

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setFormSubmitting(true);
    setFormError('');
    try {
      const res = await fetch(`/api/profiles/${profile.id}/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (data.success) { setFormSuccess(true); setContactForm({ sender_name: '', sender_email: '', message: '' }); }
      else setFormError(data.error || 'Failed to send message');
    } catch {
      setFormError('Something went wrong. Please try again.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const toggleSection = (key: string) => setExpandedSection(prev => prev === key ? null : key);

  // ── Loading / not found ─────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-4">
        <Building2 className="w-16 h-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">Business not found</h1>
        <p className="text-muted-foreground text-center">This business profile doesn't exist or has been removed.</p>
        <Link to="/" className="text-primary hover:underline text-sm">← Back to home</Link>
      </div>
    );
  }

  const socialLinks = profile.links.filter(l => l.type === 'social');
  const otherLinks = profile.links.filter(l => l.type !== 'social');

  return (
    <>
      <Helmet>
        <title>{profile.business_name} — {profile.display_name}</title>
        <meta name="description" content={profile.business_description?.slice(0, 160) || `${profile.business_name} business profile`} />
      </Helmet>

      <div className="min-h-screen bg-background">

        {/* ── Cover / Hero ─────────────────────────────────────────────── */}
        <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-background overflow-hidden">
          {profile.cover_url && (
            <img src={profile.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80" />

          {/* Search button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="absolute top-4 right-4 flex items-center gap-2 bg-background/80 backdrop-blur-sm border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-background transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search this page…</span>
          </button>
        </div>

        {/* ── Profile header ───────────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4">
          <div className="relative -mt-16 mb-6 flex items-end gap-4">
            {/* Logo / avatar */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-2xl border-4 border-background bg-card flex items-center justify-center overflow-hidden shadow-xl flex-shrink-0">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt={profile.business_name} className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-10 h-10 text-muted-foreground" />
              )}
            </div>
            <div className="pb-2 min-w-0">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight truncate">
                {profile.business_name}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">{profile.display_name}</p>
              {profile.business_category && (
                <Badge className="mt-1 bg-primary/10 text-primary border-0 text-xs">
                  {profile.business_category}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {profile.business_description && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">
              {profile.business_description}
            </p>
          )}

          {/* Quick contact row */}
          <div className="flex flex-wrap gap-2 mb-6">
            {profile.phone && (
              <a href={`tel:${profile.phone}`}
                className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <Phone className="w-3.5 h-3.5 text-primary" /> {profile.phone}
              </a>
            )}
            {profile.email && (
              <a href={`mailto:${profile.email}`}
                className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <Mail className="w-3.5 h-3.5 text-primary" /> {profile.email}
              </a>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                <Globe className="w-3.5 h-3.5 text-primary" /> Website
              </a>
            )}
            {profile.address && (
              <div className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-3 py-2 text-sm text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" /> {profile.address}
              </div>
            )}
          </div>

          {/* Social links */}
          {socialLinks.length > 0 && (
            <div className="flex gap-2 mb-6">
              {socialLinks.map(link => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                  <PlatformIcon platform={link.platform} className="w-4 h-4" />
                </a>
              ))}
            </div>
          )}

          {/* ── Announcements ─────────────────────────────────────────── */}
          {profile.announcements.length > 0 && (
            <Section
              icon={<Megaphone className="w-4 h-4" />}
              title="Updates & Announcements"
              sectionKey="announcements"
              expanded={expandedSection === 'announcements'}
              onToggle={toggleSection}
            >
              <div className="space-y-3">
                {profile.announcements.map((a, i) => (
                  <div key={i} className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {a.tag && <Badge className="text-xs border-0 bg-primary/10 text-primary">{a.tag}</Badge>}
                        {a.date && <span className="text-xs text-muted-foreground">{a.date}</span>}
                      </div>
                    </div>
                    {a.body && <p className="text-sm text-muted-foreground">{a.body}</p>}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Services ──────────────────────────────────────────────── */}
          {profile.services.length > 0 && (
            <Section
              icon={<Briefcase className="w-4 h-4" />}
              title="Services & Products"
              sectionKey="services"
              expanded={expandedSection === 'services'}
              onToggle={toggleSection}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.services.map((s, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-semibold text-foreground">{s.name}</p>
                      {s.price && (
                        <span className="text-sm font-bold text-primary flex-shrink-0">{s.price}</span>
                      )}
                    </div>
                    {s.category && (
                      <Badge className="text-xs border-0 bg-muted text-muted-foreground mb-1">{s.category}</Badge>
                    )}
                    {s.description && (
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Team ──────────────────────────────────────────────────── */}
          {profile.team_members.length > 0 && (
            <Section
              icon={<Users className="w-4 h-4" />}
              title="Our Team"
              sectionKey="team"
              expanded={expandedSection === 'team'}
              onToggle={toggleSection}
            >
              <div className="grid sm:grid-cols-2 gap-3">
                {profile.team_members.map((m, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {m.photo
                        ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                        : <span className="text-primary font-bold text-sm">{m.name.charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      {m.role && <p className="text-xs text-primary">{m.role}</p>}
                      {m.bio && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.bio}</p>}
                      <div className="flex gap-2 mt-2">
                        {m.email && (
                          <a href={`mailto:${m.email}`} className="text-muted-foreground hover:text-primary transition-colors">
                            <Mail className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {m.linkedin && (
                          <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* ── Opening hours ─────────────────────────────────────────── */}
          {profile.opening_hours && (
            <Section
              icon={<Clock className="w-4 h-4" />}
              title="Opening Hours"
              sectionKey="hours"
              expanded={expandedSection === 'hours'}
              onToggle={toggleSection}
            >
              <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans leading-relaxed">
                {profile.opening_hours}
              </pre>
            </Section>
          )}

          {/* ── Other links ───────────────────────────────────────────── */}
          {otherLinks.length > 0 && (
            <Section
              icon={<Globe className="w-4 h-4" />}
              title="Links"
              sectionKey="links"
              expanded={expandedSection === 'links'}
              onToggle={toggleSection}
            >
              <div className="space-y-2">
                {otherLinks.map(link => (
                  <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-between bg-card border border-border rounded-xl px-4 py-3 text-sm text-foreground hover:bg-muted transition-colors group">
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={link.platform} className="w-4 h-4 text-primary" />
                      <span>{link.label}</span>
                    </div>
                    <Globe className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </a>
                ))}
              </div>
            </Section>
          )}

          {/* ── Contact form ──────────────────────────────────────────── */}
          {profile.plan.has_contact_form ? (
            <Section
              icon={<MessageCircle className="w-4 h-4" />}
              title="Send a Message"
              sectionKey="contact"
              expanded={expandedSection === 'contact'}
              onToggle={toggleSection}
            >
              {formSuccess ? (
                <div className="flex flex-col items-center gap-3 py-6">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                  <p className="text-sm font-semibold text-foreground">Message sent!</p>
                  <p className="text-xs text-muted-foreground">We'll get back to you as soon as possible.</p>
                  <button onClick={() => setFormSuccess(false)} className="text-xs text-primary hover:underline">Send another</button>
                </div>
              ) : (
                <form onSubmit={submitContact} className="space-y-3">
                  <Input
                    placeholder="Your name"
                    value={contactForm.sender_name}
                    onChange={e => setContactForm(f => ({ ...f, sender_name: e.target.value }))}
                    required
                    className="bg-background border-border"
                  />
                  <Input
                    type="email"
                    placeholder="Your email"
                    value={contactForm.sender_email}
                    onChange={e => setContactForm(f => ({ ...f, sender_email: e.target.value }))}
                    required
                    className="bg-background border-border"
                  />
                  <Textarea
                    placeholder="Your message…"
                    value={contactForm.message}
                    onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                    required
                    rows={4}
                    className="bg-background border-border resize-none"
                  />
                  {formError && <p className="text-xs text-destructive">{formError}</p>}
                  <Button type="submit" disabled={formSubmitting} className="w-full bg-primary gap-2">
                    <Send className="w-4 h-4" />
                    {formSubmitting ? 'Sending…' : 'Send Message'}
                  </Button>
                </form>
              )}
            </Section>
          ) : null}

          {/* Share + branding footer */}
          <div className="flex items-center justify-between py-8 mt-4 border-t border-border">
            <button
              onClick={() => navigator.share?.({ title: profile.business_name, url: window.location.href })
                .catch(() => navigator.clipboard.writeText(window.location.href))}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" /> Share
            </button>
            {!profile.plan.remove_branding && (
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Powered by {branding.platform_name || 'JA Smart Profile'}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Search overlay ──────────────────────────────────────────────── */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
              <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder={`Search ${profile.business_name}…`}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
              />
              <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  Type to search services, team, contact details, and more…
                </div>
              ) : searchResults && searchResults.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No results for "<strong>{searchQuery}</strong>"
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {searchResults?.map((r, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge className="text-xs border-0 bg-primary/10 text-primary">{r.section}</Badge>
                        <span className="text-sm font-medium text-foreground">
                          <Highlight text={r.label} query={searchQuery} />
                        </span>
                      </div>
                      {r.text && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          <Highlight text={r.text} query={searchQuery} />
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────

function Section({
  icon, title, sectionKey, expanded, onToggle, children,
}: {
  icon: React.ReactNode;
  title: string;
  sectionKey: string;
  expanded: boolean;
  onToggle: (key: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 bg-card border border-border rounded-2xl overflow-hidden">
      <button
        onClick={() => onToggle(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
          <span className="text-primary">{icon}</span>
          {title}
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
          : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-border/50 pt-3">
          {children}
        </div>
      )}
    </div>
  );
}
