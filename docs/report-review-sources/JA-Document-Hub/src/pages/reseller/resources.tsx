import { useState, useEffect } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import ResellerLayout from '@/components/ResellerLayout';
import ComingSoonOverlay from '@/components/ComingSoonOverlay';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Download, ExternalLink, FileText, Image, Link2 } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  marketing: 'Marketing', brand: 'Brand Assets', product: 'Product Info',
  pricing: 'Pricing', onboarding: 'Onboarding', legal: 'Legal',
  faq: 'FAQs', general: 'General',
};

const FILE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText, docx: FileText, image: Image, link: Link2,
};

interface Resource {
  uuid: string; title: string; description: string | null;
  category: string; fileUrl: string | null; externalUrl: string | null;
  fileType: string | null;
}

export default function ResellerResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/reseller/resources', { credentials: 'include' })
      .then(r => r.json())
      .then(d => { if (d.success) setResources(d.resources); else setError(d.error ?? 'Failed to load.'); })
      .catch(() => setError('Network error.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = [...new Set(resources.map(r => r.category))];

  return (
    <ComingSoonOverlay>
    <ResellerLayout>
      <Helmet><title>Resources — Reseller Portal</title></Helmet>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Resources</h1>
          <p className="text-muted-foreground text-sm mt-1">Marketing materials, guides, and assets to help you sell.</p>
        </div>

        {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading resources…</div>
        ) : !resources.length ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No resources available yet. Check back soon.</p>
            </CardContent>
          </Card>
        ) : (
          categories.map(cat => (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.filter(r => r.category === cat).map(r => {
                  const Icon = FILE_ICONS[r.fileType ?? ''] ?? FileText;
                  const url = r.fileUrl ?? r.externalUrl;
                  const isExternal = !!r.externalUrl;
                  return (
                    <Card key={r.uuid} className="hover:border-primary/40 transition-colors">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground text-sm leading-tight mb-1">{r.title}</h3>
                            {r.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{r.description}</p>}
                            {url && (
                              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                                <a href={url} target={isExternal ? '_blank' : undefined} rel={isExternal ? 'noopener noreferrer' : undefined} download={!isExternal}>
                                  {isExternal ? <ExternalLink className="w-3 h-3 mr-1" /> : <Download className="w-3 h-3 mr-1" />}
                                  {isExternal ? 'Open' : 'Download'}
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </ResellerLayout>
    </ComingSoonOverlay>
  );
}
