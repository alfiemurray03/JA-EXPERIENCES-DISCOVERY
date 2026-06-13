import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import {
  Phone, Mail, Globe, MapPin, Share2, Download, QrCode, Send,
  Linkedin, Twitter, Instagram, Facebook, Youtube, Github, ArrowRight, X, Zap,
  MessageCircle, CheckCircle2, Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useBranding } from '@/lib/branding';

interface PublicProfile {
  id: number; username: string; display_name: string; job_title: string; company: string;
  bio: string; phone: string; email: string; website: string; address: string;
  profile_photo: string; theme_id: number;
  messaging_enabled: number;
  enquiry_enabled: number;
  plan: { has_contact_form: number; has_vcard_download: number; remove_branding: number; has_messaging: number };
  theme: { primary_color: string; accent_color: string; background_color: string; text_color: string };
  links: { id: number; type: string; platform: string | null; label: string; url: string; icon: string | null }[];
}

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

function generateVCard(profile: PublicProfile): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.display_name || ''}`,
    profile.job_title ? `TITLE:${profile.job_title}` : '',
    profile.company ? `ORG:${profile.company}` : '',
    profile.phone ? `TEL:${profile.phone}` : '',
    profile.email ? `EMAIL:${profile.email}` : '',
    profile.website ? `URL:${profile.website}` : '',
    profile.address ? `ADR:;;${profile.address};;;;` : '',
    'END:VCARD',
  ].filter(Boolean);
  return lines.join('\n');
}

export default function PublicProfilePage() {
  const { prefix, username } = useParams<{ prefix: string; username: string }>();
  const branding = useBranding();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [contactForm, setContactForm] = useState({ sender_name: '', sender_email: '', message: '' });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Direct messaging state
  const [showMessageForm, setShowMessageForm] = useState(false);
  const [msgForm, setMsgForm] = useState({ sender_name: '', sender_email: '', subject: '', body: '' });
  const [msgSubmitting, setMsgSubmitting] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState(false);
  const [msgThreadId, setMsgThreadId] = useState<number | null>(null);
  const [msgVisitorToken, setMsgVisitorToken] = useState<string | null>(null);
  const [msgError, setMsgError] = useState('');

  useEffect(() => {
    if (!prefix || !username) return;
    fetch(`/api/profiles/${prefix}/${username}/public`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(d => {
        if (d.success) {
          setProfile(d.data);
          fetch(`/api/analytics/view/${username}`, { method: 'POST' }).catch(() => {});
        } else {
          setNotFound(true);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [prefix, username]);

  const recordClick = (linkId: number) => {
    fetch(`/api/links/${linkId}/click`, { method: 'POST' }).catch(() => {});
  };

  const downloadVCard = () => {
    if (!profile) return;
    const vcf = generateVCard(profile);
    const blob = new Blob([vcf], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.display_name || profile.username}.vcf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const shareProfile = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: profile?.display_name || '', url });
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const loadQR = async () => {
    if (qrDataUrl) { setShowQR(true); return; }
    const url = window.location.href;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    setQrDataUrl(qrUrl);
    setShowQR(true);
  };

  const submitContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);
    try {
      const res = await fetch(`/api/enquiries/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFormSuccess(true);
      setContactForm({ sender_name: '', sender_email: '', message: '' });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setFormSubmitting(false);
    }
  };

  const submitDirectMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsgError('');
    setMsgSubmitting(true);
    try {
      const res = await fetch(`/api/messages/${username}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(msgForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setMsgSuccess(true);
      setMsgThreadId(data.thread_id);
      setMsgVisitorToken(data.visitor_token ?? null);
    } catch (err) {
      setMsgError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setMsgSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <Helmet><title>Profile Not Found — {branding.platform_name}</title></Helmet>
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6">
          <Globe className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">Profile not found</h1>
        <p className="text-muted-foreground mb-6">This profile doesn't exist or has been removed.</p>
        <Link to="/">
          <Button className="bg-primary">Go to {branding.platform_name}</Button>
        </Link>
      </div>
    );
  }

  if (!profile) return null;

  const theme = profile.theme || { primary_color: '#3B82F6', accent_color: '#3B82F6', background_color: '#FFFFFF', text_color: '#0F172A' };
  const socialLinks = profile.links.filter(l => l.type === 'social');
  const customLinks = profile.links.filter(l => l.type !== 'social');

  const themeStyle = {
    '--profile-bg': theme.background_color,
    '--profile-text': theme.text_color,
    '--profile-primary': theme.primary_color,
    '--profile-accent': theme.accent_color,
  } as React.CSSProperties;

  return (
    <>
      <Helmet>
        <title>{profile.display_name || profile.username} — {branding.platform_name}</title>
        <meta name="description" content={profile.bio || `${profile.display_name}'s digital business card`} />
      </Helmet>

      <div className="min-h-screen flex flex-col items-center py-8 px-4" style={{ backgroundColor: theme.background_color, ...themeStyle }}>
        <div className="w-full max-w-sm">
          {/* Profile Card */}
          <div className="rounded-3xl overflow-hidden shadow-xl mb-4" style={{ backgroundColor: theme.background_color, border: `1px solid ${theme.primary_color}20` }}>
            <div className="p-6">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-5">
                {profile.profile_photo ? (
                  <img src={profile.profile_photo} alt={profile.display_name} className="w-24 h-24 rounded-full object-cover mb-3 ring-4 ring-blue-500/30" />
                ) : (
                  <div className="w-24 h-24 rounded-full flex items-center justify-center mb-3 text-3xl font-bold text-white" style={{ backgroundColor: theme.primary_color }}>
                    {(profile.display_name || profile.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <h1 className="text-xl font-bold text-center" style={{ color: theme.text_color }}>{profile.display_name}</h1>
                {(profile.job_title || profile.company) && (
                  <p className="text-sm text-center mt-1" style={{ color: theme.text_color, opacity: 0.7 }}>
                    {[profile.job_title, profile.company].filter(Boolean).join(' · ')}
                  </p>
                )}
                {profile.bio && (
                  <p className="text-sm text-center mt-3 leading-relaxed" style={{ color: theme.text_color, opacity: 0.8 }}>{profile.bio}</p>
                )}
              </div>

              {/* Contact buttons */}
              {(profile.phone || profile.email || profile.website) && (
                <div className="flex gap-2 mb-4">
                  {profile.phone && (
                    <a href={`tel:${profile.phone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
                      style={{ backgroundColor: theme.primary_color }}>
                      <Phone className="w-4 h-4" /> Call
                    </a>
                  )}
                  {profile.email && (
                    <a href={`mailto:${profile.email}`} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ backgroundColor: theme.primary_color + '20', color: theme.primary_color }}>
                      <Mail className="w-4 h-4" /> Email
                    </a>
                  )}
                  {profile.website && (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
                      style={{ backgroundColor: theme.primary_color + '20', color: theme.primary_color }}>
                      <Globe className="w-4 h-4" /> Web
                    </a>
                  )}
                </div>
              )}

              {profile.address && (
                <div className="flex items-center gap-2 mb-4 text-sm" style={{ color: theme.text_color, opacity: 0.7 }}>
                  <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: theme.primary_color }} />
                  {profile.address}
                </div>
              )}

              {/* Social links */}
              {socialLinks.length > 0 && (
                <div className="flex gap-2 flex-wrap mb-4">
                  {socialLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      onClick={() => recordClick(link.id)}
                      className="w-10 h-10 rounded-xl flex items-center justify-center transition-opacity hover:opacity-80"
                      style={{ backgroundColor: theme.primary_color + '15', color: theme.primary_color }}
                      title={link.label}>
                      <PlatformIcon platform={link.platform} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}

              {/* Custom links */}
              {customLinks.length > 0 && (
                <div className="space-y-2 mb-4">
                  {customLinks.map(link => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"
                      onClick={() => recordClick(link.id)}
                      className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all hover:opacity-90"
                      style={{ backgroundColor: theme.primary_color + '15', color: theme.text_color }}>
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4" style={{ color: theme.primary_color }} />
                    </a>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 mb-4">
                <button onClick={downloadVCard}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-80"
                  style={{ borderColor: theme.primary_color + '40', color: theme.primary_color }}>
                  <Download className="w-4 h-4" /> Save Contact
                </button>
                <button onClick={shareProfile}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm font-medium border transition-opacity hover:opacity-80"
                  style={{ borderColor: theme.primary_color + '40', color: theme.primary_color }}>
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={loadQR}
                  className="w-12 flex items-center justify-center py-2.5 rounded-xl border transition-opacity hover:opacity-80"
                  style={{ borderColor: theme.primary_color + '40', color: theme.primary_color }}>
                  <QrCode className="w-4 h-4" />
                </button>
              </div>

              {/* Direct Message button — only shown when messaging is enabled */}
              {!!profile.messaging_enabled && (
              <button
                onClick={() => setShowMessageForm(v => !v)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 mb-4"
                style={{ backgroundColor: theme.primary_color }}
              >
                <MessageCircle className="w-4 h-4" />
                {showMessageForm ? 'Close' : 'Send a Direct Message'}
              </button>
              )}

              {/* Direct message form */}
              {showMessageForm && !!profile.messaging_enabled && (
                <div className="border-t pt-4 mb-4" style={{ borderColor: theme.primary_color + '20' }}>
                  {msgSuccess ? (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium" style={{ color: theme.text_color }}>Message sent!</p>
                      <p className="text-xs mt-1" style={{ color: theme.text_color, opacity: 0.6 }}>
                        {profile.display_name} will review your message. Once accepted, you can reply directly.
                      </p>
                      {msgThreadId && msgVisitorToken && (
                        <a
                          href={`/conversation/${msgThreadId}?token=${encodeURIComponent(msgVisitorToken)}`}
                          className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium px-3 py-1.5 rounded-lg text-white"
                          style={{ backgroundColor: theme.primary_color }}
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Open conversation
                        </a>
                      )}
                      {msgThreadId && (
                        <p className="text-xs mt-2 font-mono opacity-40" style={{ color: theme.text_color }}>
                          Thread #{msgThreadId}
                        </p>
                      )}
                    </div>
                  ) : (
                    <form onSubmit={submitDirectMessage} className="space-y-3">
                      <h3 className="font-semibold text-sm mb-3" style={{ color: theme.text_color }}>
                        <MessageCircle className="w-4 h-4 inline mr-1.5" style={{ color: theme.primary_color }} />
                        Direct Message
                      </h3>
                      {msgError && <p className="text-xs text-red-500">{msgError}</p>}
                      <div className="grid grid-cols-2 gap-2">
                        <Input value={msgForm.sender_name} onChange={e => setMsgForm(f => ({ ...f, sender_name: e.target.value }))}
                          placeholder="Your name" required className="text-sm" style={{ borderColor: theme.primary_color + '30' }} />
                        <Input type="email" value={msgForm.sender_email} onChange={e => setMsgForm(f => ({ ...f, sender_email: e.target.value }))}
                          placeholder="Your email" required className="text-sm" style={{ borderColor: theme.primary_color + '30' }} />
                      </div>
                      <Input value={msgForm.subject} onChange={e => setMsgForm(f => ({ ...f, subject: e.target.value }))}
                        placeholder="Subject (optional)" className="text-sm" style={{ borderColor: theme.primary_color + '30' }} />
                      <Textarea value={msgForm.body} onChange={e => setMsgForm(f => ({ ...f, body: e.target.value }))}
                        placeholder="Your message…" required rows={3} className="text-sm resize-none" style={{ borderColor: theme.primary_color + '30' }} />
                      <button type="submit" disabled={msgSubmitting}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                        style={{ backgroundColor: theme.primary_color }}>
                        <Send className="w-4 h-4" />
                        {msgSubmitting ? 'Sending…' : 'Send Message'}
                      </button>
                      <p className="text-xs text-center opacity-50" style={{ color: theme.text_color }}>
                        <Lock className="w-3 h-3 inline mr-1" />
                        Your message goes directly to {profile.display_name}
                      </p>
                    </form>
                  )}
                </div>
              )}

              {/* QR Code modal */}
              {showQR && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowQR(false)}>
                  <div className="bg-white rounded-3xl p-6 text-center max-w-xs w-full" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">Scan QR Code</h3>
                      <button onClick={() => setShowQR(false)} className="text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <img src={qrDataUrl} alt="QR Code" className="w-48 h-48 mx-auto mb-3" />
                    <p className="text-xs text-gray-500">{window.location.href}</p>
                  </div>
                </div>
              )}

              {/* Contact form (legacy enquiries) */}
              {profile.plan.has_contact_form ? (
                <div className="border-t pt-4 mt-2" style={{ borderColor: theme.primary_color + '20' }}>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: theme.text_color }}>Send an Enquiry</h3>
                  {formSuccess ? (
                    <div className="text-center py-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                        <Send className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-sm font-medium" style={{ color: theme.text_color }}>Enquiry sent!</p>
                      <p className="text-xs mt-1" style={{ color: theme.text_color, opacity: 0.6 }}>Thanks for reaching out.</p>
                    </div>
                  ) : (
                    <form onSubmit={submitContact} className="space-y-3">
                      {formError && <p className="text-xs text-red-500">{formError}</p>}
                      <Input value={contactForm.sender_name} onChange={e => setContactForm(f => ({ ...f, sender_name: e.target.value }))}
                        placeholder="Your name" required className="text-sm" style={{ borderColor: theme.primary_color + '30' }} />
                      <Input type="email" value={contactForm.sender_email} onChange={e => setContactForm(f => ({ ...f, sender_email: e.target.value }))}
                        placeholder="Your email" required className="text-sm" style={{ borderColor: theme.primary_color + '30' }} />
                      <Textarea value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Your message..." required rows={3} className="text-sm resize-none" style={{ borderColor: theme.primary_color + '30' }} />
                      <button type="submit" disabled={formSubmitting}
                        className="w-full py-2.5 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                        style={{ backgroundColor: theme.primary_color }}>
                        {formSubmitting ? 'Sending...' : 'Send Enquiry'}
                      </button>
                    </form>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Branding */}
          {!profile.plan.remove_branding && (
            <div className="text-center">
              <Link to="/" className="inline-flex items-center gap-1.5 text-xs opacity-50 hover:opacity-70 transition-opacity" style={{ color: theme.text_color }}>
                <div className="w-4 h-4 rounded bg-primary flex items-center justify-center">
                  <Zap style={{ width: '8px', height: '8px', color: 'white' }} />
                </div>
                Powered by {branding.platform_name}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
