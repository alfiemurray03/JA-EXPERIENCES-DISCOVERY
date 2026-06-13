import { useState, useEffect } from 'react';
import { FileText, Save, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff, Clock, Code2, AlignLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PolicyDoc {
  title: string;
  version: string;
  effective_date: string;
  content: string;
  is_published: boolean;
  last_updated: string;
}

const defaultPolicies: Record<string, PolicyDoc> = {
  terms: {
    title: 'Terms of Service',
    version: '1.0',
    effective_date: new Date().toISOString().split('T')[0],
    is_published: true,
    last_updated: new Date().toISOString(),
    content: `# Terms of Service

**Effective Date:** [DATE]  
**Version:** 1.0

## 1. Acceptance of Terms

By accessing or using JA Smart Profile ("the Service"), operated by JA Group Services Ltd ("we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.

JA Smart Profile is a service provided by JA Group Services Ltd.

## 2. Description of Service

JA Smart Profile is a digital business card and profile link management platform that allows users to create, manage, and share professional digital profiles.

## 3. User Accounts

3.1 You must be at least 18 years old to use the Service.  
3.2 You are responsible for maintaining the confidentiality of your account credentials.  
3.3 You are responsible for all activity that occurs under your account.  
3.4 You must provide accurate and complete information when creating your account.

## 4. Acceptable Use

You agree not to:
- Use the Service for any unlawful purpose or in violation of any regulations
- Post or share content that is defamatory, obscene, or infringes third-party rights
- Attempt to gain unauthorised access to any part of the Service
- Use automated tools to scrape or extract data from the Service
- Impersonate any person or entity

## 5. Intellectual Property

5.1 The Service and its original content, features, and functionality are owned by JA Group Services Ltd and are protected by intellectual property laws.  
5.2 You retain ownership of content you create and publish through the Service.  
5.3 By using the Service, you grant us a limited licence to display your content as necessary to provide the Service.

## 6. Privacy

Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.

## 7. Limitation of Liability

To the maximum extent permitted by law, JA Group Services Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service.

## 8. Termination

We reserve the right to suspend or terminate your account at any time for violation of these Terms or for any other reason at our sole discretion.

## 9. Changes to Terms

We may update these Terms from time to time. We will notify you of significant changes by updating the version number and effective date. Continued use of the Service after changes constitutes acceptance of the new Terms.

## 10. Governing Law

These Terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales.

## 11. Contact

For questions about these Terms, please contact us at:  
**JA Group Services Ltd**  
Email: legal@jagroupservices.co.uk`,
  },
  privacy: {
    title: 'Privacy Policy',
    version: '1.0',
    effective_date: new Date().toISOString().split('T')[0],
    is_published: true,
    last_updated: new Date().toISOString(),
    content: `# Privacy Policy

**Effective Date:** [DATE]  
**Version:** 1.0

## 1. Introduction

JA Group Services Ltd ("we", "us", "our") is committed to protecting your personal data. This Privacy Policy explains how we collect, use, store, and protect your information when you use JA Smart Profile ("the Service").

This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.

## 2. Data Controller

**JA Group Services Ltd**  
Email: privacy@jagroupservices.co.uk

## 3. Data We Collect

### 3.1 Account Data
- Name and email address (provided via JA Group Services Secure Access)
- Account creation date and last login

### 3.2 Profile Data
- Professional information you choose to add (job title, company, bio, phone, website)
- Profile photo (if uploaded)
- Links and social media handles you add to your profile

### 3.3 Usage Data
- Page views and link clicks on your public profile
- IP addresses (anonymised after 30 days)
- Browser and device information

### 3.4 Communications
- Messages submitted via your profile's contact form

## 4. How We Use Your Data

We use your data to:
- Provide and maintain the Service
- Display your public profile to visitors
- Send you service-related notifications
- Analyse platform usage to improve the Service
- Comply with legal obligations

**Legal basis:** Contract performance (Art. 6(1)(b) UK GDPR) and legitimate interests (Art. 6(1)(f) UK GDPR).

## 5. Data Sharing

We do not sell your personal data. We may share data with:
- **JA Group Services Secure Access** — for authentication services
- **Hosting providers** — for infrastructure
- **Law enforcement** — where required by law

## 6. Data Retention

- Account data: retained for the duration of your account plus 30 days after deletion
- Usage analytics: aggregated data retained for 12 months; raw data for 30 days
- Contact form messages: retained for 12 months

## 7. Your Rights

Under UK GDPR, you have the right to:
- **Access** your personal data
- **Rectify** inaccurate data
- **Erase** your data ("right to be forgotten")
- **Restrict** processing of your data
- **Data portability**
- **Object** to processing

To exercise these rights, contact: privacy@jagroupservices.co.uk

## 8. Cookies

We use essential cookies for session management and optional analytics cookies. You can manage your cookie preferences via the cookie banner.

## 9. Security

We implement appropriate technical and organisational measures to protect your data, including encryption in transit (TLS), access controls, and regular security reviews.

## 10. Changes to This Policy

We will notify you of material changes by updating the version number and effective date. Continued use of the Service constitutes acceptance.

## 11. Complaints

You have the right to lodge a complaint with the Information Commissioner's Office (ICO):  
**ico.org.uk** | 0303 123 1113`,
  },
  cookies: {
    title: 'Cookie Policy',
    version: '1.0',
    effective_date: new Date().toISOString().split('T')[0],
    is_published: true,
    last_updated: new Date().toISOString(),
    content: `# Cookie Policy

**Effective Date:** [DATE]  
**Version:** 1.0

## 1. What Are Cookies?

Cookies are small text files placed on your device when you visit a website. They help websites function correctly and provide information to website owners.

## 2. Cookies We Use

### 2.1 Essential Cookies (Always Active)
| Cookie | Purpose | Duration |
|--------|---------|----------|
| connect.sid | Session management — keeps you signed in | Session |

### 2.2 Analytics Cookies (Optional)
| Cookie | Purpose | Duration |
|--------|---------|----------|
| _analytics | Anonymous usage tracking | 12 months |

### 2.3 Preference Cookies (Optional)
| Cookie | Purpose | Duration |
|--------|---------|----------|
| cookie_consent | Stores your cookie preferences | 12 months |

## 3. Managing Cookies

You can manage cookies through:
- **Our cookie banner** — shown on your first visit
- **Browser settings** — most browsers allow you to block or delete cookies
- **Opt-out tools** — for analytics cookies

Note: Disabling essential cookies will prevent you from signing in.

## 4. Third-Party Cookies

We use JA Group Services Secure Access for authentication, which may set its own cookies. Please refer to JA Group Services' privacy policy for details.

## 5. Contact

For questions about our use of cookies:  
Email: privacy@jagroupservices.co.uk`,
  },
};

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function AdminLegal() {
  const [policies, setPolicies] = useState(defaultPolicies);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<Record<string, SaveStatus>>({});
  const [previewing, setPreviewing] = useState<string | null>(null);
  // 'markdown' | 'html' per policy key
  const [editorMode, setEditorMode] = useState<Record<string, 'markdown' | 'html'>>({});

  useEffect(() => {
    fetch('/api/admin/legal', { credentials: 'include' })
      .then(r => r.json())
      .then(d => {
        if (d.success && d.data) {
          setPolicies(prev => ({ ...prev, ...d.data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const updatePolicy = (key: string, field: keyof PolicyDoc, value: string | boolean) => {
    setPolicies(p => ({ ...p, [key]: { ...p[key], [field]: value } }));
  };

  const savePolicy = async (key: string) => {
    setSaveStatus(s => ({ ...s, [key]: 'saving' }));
    try {
      const res = await fetch(`/api/admin/legal/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...policies[key], last_updated: new Date().toISOString() }),
      });
      const data = await res.json();
      const status = data.success ? 'saved' : 'error';
      setSaveStatus(s => ({ ...s, [key]: status }));
      if (data.success) setTimeout(() => setSaveStatus(s => ({ ...s, [key]: 'idle' })), 3000);
    } catch {
      setSaveStatus(s => ({ ...s, [key]: 'error' }));
    }
  };

  const policyKeys = ['terms', 'privacy', 'cookies'];
  const policyLabels: Record<string, string> = { terms: 'Terms', privacy: 'Privacy', cookies: 'Cookies' };

  if (loading) return (
    <div className="max-w-4xl mx-auto space-y-6">
      {[1, 2].map(i => <div key={i} className="h-64 rounded-2xl bg-muted/30 animate-pulse" />)}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Legal Policies</h1>
        <p className="text-muted-foreground mt-1">Manage your platform's Terms of Service, Privacy Policy, and Cookie Policy</p>
      </div>

      {/* Policy status overview */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {policyKeys.map(key => {
          const p = policies[key];
          return (
            <Card key={key} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <Badge className={p.is_published ? 'bg-green-500/10 text-green-400 border-0 text-xs' : 'bg-muted text-muted-foreground border-0 text-xs'}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                <p className="text-xs text-muted-foreground mt-1">v{p.version} · Effective {p.effective_date}</p>
                <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Updated {new Date(p.last_updated).toLocaleDateString('en-GB')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Editor tabs */}
      <Tabs defaultValue="terms">
        <TabsList className="bg-muted border border-border mb-6">
          {policyKeys.map(key => (
            <TabsTrigger key={key} value={key} className="data-[state=active]:bg-background">
              {policyLabels[key]}
            </TabsTrigger>
          ))}
        </TabsList>

        {policyKeys.map(key => {
          const p = policies[key];
          const status = saveStatus[key] ?? 'idle';
          return (
            <TabsContent key={key} value={key}>
              <Card className="bg-card border-border">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{p.title}</CardTitle>
                      <CardDescription>Edit the content, version, and publication status</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPreviewing(previewing === key ? null : key)}
                        className="gap-1.5 border-border"
                      >
                        {previewing === key ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        {previewing === key ? 'Edit' : 'Preview'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => savePolicy(key)}
                        disabled={status === 'saving'}
                        className="bg-primary hover:bg-primary/90 gap-1.5"
                      >
                        {status === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                         status === 'saved' ? <CheckCircle2 className="w-3.5 h-3.5" /> :
                         status === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> :
                         <Save className="w-3.5 h-3.5" />}
                        {status === 'saving' ? 'Saving…' : status === 'saved' ? 'Saved' : status === 'error' ? 'Error' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* Meta fields */}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Version</Label>
                      <Input
                        value={p.version}
                        onChange={e => updatePolicy(key, 'version', e.target.value)}
                        className="bg-background border-border"
                        placeholder="e.g. 1.0"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Effective Date</Label>
                      <Input
                        type="date"
                        value={p.effective_date}
                        onChange={e => updatePolicy(key, 'effective_date', e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                      <div className="flex items-center gap-3 h-10">
                        <button
                          onClick={() => updatePolicy(key, 'is_published', !p.is_published)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.is_published ? 'bg-primary' : 'bg-muted'}`}
                        >
                          <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.is_published ? 'translate-x-4' : 'translate-x-1'}`} />
                        </button>
                        <span className="text-sm text-foreground">{p.is_published ? 'Published' : 'Draft'}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Editor mode toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                      <button
                        onClick={() => setEditorMode(m => ({ ...m, [key]: 'markdown' }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          (editorMode[key] ?? 'markdown') === 'markdown'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <AlignLeft className="w-3.5 h-3.5" /> Markdown
                      </button>
                      <button
                        onClick={() => setEditorMode(m => ({ ...m, [key]: 'html' }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          editorMode[key] === 'html'
                            ? 'bg-background text-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <Code2 className="w-3.5 h-3.5" /> HTML
                      </button>
                    </div>
                    {editorMode[key] === 'html' && (
                      <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                        Raw HTML — will render as-is on the public policy page
                      </Badge>
                    )}
                  </div>

                  {/* Content editor / preview */}
                  {previewing === key ? (
                    editorMode[key] === 'html' ? (
                      <div className="bg-background border border-border rounded-xl p-6 min-h-96 overflow-auto">
                        <div
                          className="prose prose-sm prose-invert max-w-none text-foreground"
                          dangerouslySetInnerHTML={{ __html: p.content }}
                        />
                      </div>
                    ) : (
                      <div className="bg-background border border-border rounded-xl p-6 min-h-96 prose prose-sm prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap text-sm text-foreground font-sans leading-relaxed">{p.content}</pre>
                      </div>
                    )
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">
                        {editorMode[key] === 'html'
                          ? <>Policy Content <span className="text-amber-400">(HTML)</span></>
                          : <>Policy Content <span className="text-muted-foreground/60">(Markdown supported)</span></>
                        }
                      </Label>
                      <Textarea
                        value={p.content}
                        onChange={e => updatePolicy(key, 'content', e.target.value)}
                        className="bg-background border-border font-mono text-xs resize-none min-h-[500px]"
                        spellCheck={false}
                        placeholder={editorMode[key] === 'html'
                          ? '<h1>Policy Title</h1>\n<p>Your policy content here...</p>'
                          : '# Policy Title\n\nYour policy content here...'
                        }
                      />
                      {editorMode[key] === 'html' && (
                        <p className="text-xs text-muted-foreground">
                          Enter valid HTML. Use standard tags: &lt;h1&gt;–&lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;a&gt;, &lt;table&gt;.
                          Script tags and event handlers are stripped on render.
                        </p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
