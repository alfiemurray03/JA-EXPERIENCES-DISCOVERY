import { useState, useEffect } from 'react';
import { Download, Copy, Check, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';

export default function QRCodePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ id: number; username: string } | null>(null);
  const [qrData, setQrData] = useState<{ qr_data_url: string; profile_url: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [plan, setPlan] = useState<{ has_qr_download: number; name: string } | null>(null);

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
        const p = profilesData.data[0];
        setProfile(p);
        const qrRes = await fetch(`/api/qr/${p.id}`, { credentials: 'include' });
        const qrData = await qrRes.json();
        if (qrData.success) setQrData(qrData.data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const copyLink = async () => {
    if (!qrData) return;
    await navigator.clipboard.writeText(qrData.profile_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    if (!qrData) return;
    const a = document.createElement('a');
    a.href = qrData.qr_data_url;
    a.download = `${profile?.username || 'profile'}-qr-code.png`;
    a.click();
  };

  if (loading) return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <Skeleton className="h-8 w-48 mb-8" />
      <Skeleton className="h-96 w-full rounded-2xl" />
    </div>
  );

  return (
    <div className="max-w-lg mx-auto pb-20 lg:pb-0">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">QR Code</h1>
        <p className="text-muted-foreground mt-1">Share your profile with a QR code</p>
      </div>

      {!profile ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <QrCode className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Create a profile first to generate your QR code</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="bg-card border-border mb-6">
            <CardHeader className="text-center">
              <CardTitle>Your Profile QR Code</CardTitle>
              <CardDescription>{qrData?.profile_url}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">
              {qrData ? (
                <div className="p-4 bg-white rounded-2xl shadow-lg">
                  <img src={qrData.qr_data_url} alt="QR Code" className="w-56 h-56" />
                </div>
              ) : (
                <div className="w-64 h-64 bg-muted rounded-2xl flex items-center justify-center">
                  <QrCode className="w-16 h-16 text-muted-foreground" />
                </div>
              )}

              <div className="flex gap-3 w-full">
                <Button onClick={copyLink} variant="outline" className="flex-1 border-border gap-2">
                  {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy Link</>}
                </Button>
                {plan?.has_qr_download ? (
                  <Button onClick={downloadQR} className="flex-1 bg-primary gap-2">
                    <Download className="w-4 h-4" /> Download PNG
                  </Button>
                ) : (
                  <Button disabled className="flex-1 gap-2 opacity-50">
                    <Download className="w-4 h-4" /> Download PNG
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {!plan?.has_qr_download && (
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="py-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Download className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Download available on Starter+</p>
                  <p className="text-xs text-muted-foreground">Upgrade to download your QR code as a PNG to print on business cards and flyers.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-card border-border mt-6">
            <CardHeader><CardTitle className="text-base">How to use your QR code</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                'Print it on your physical business cards',
                'Add it to your email signature',
                'Display it at events and conferences',
                'Include it in presentations and proposals',
              ].map((tip, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-primary text-xs font-bold">{i + 1}</span>
                  </div>
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
