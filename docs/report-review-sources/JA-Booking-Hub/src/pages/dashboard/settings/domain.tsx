import { Helmet } from '@dr.pogodin/react-helmet';
import { Globe, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function DomainSettingsPage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Domain Settings — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Domain Settings</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your booking page URL and custom domain</p>
        </div>

        {/* Current subdomain */}
        <Card className="border-border mb-6">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-[#0F172A] mb-1">Your Booking Page URL</p>
            <p className="text-xs text-muted-foreground mb-3">
              Your booking page is live at your JABooking subdomain. Share this link with your customers.
            </p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-border">
              <Globe size={15} className="text-muted-foreground shrink-0" />
              <span className="text-sm font-mono text-[#0F172A] flex-1 truncate">
                https://my-business.jabooking.jagroupservices.co.uk
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Custom domain coming soon */}
        <Card className="border-border">
          <CardContent className="p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
              <Clock size={28} className="text-indigo-500" />
            </div>
            <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-amber-200 mb-4">
              Coming Soon
            </div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-3">Custom Domain Support</h2>
            <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
              Soon you'll be able to connect your own domain (e.g. <span className="font-mono text-[#0F172A]">bookings.yourbusiness.co.uk</span>) to your JABooking page. We'll handle DNS verification and SSL automatically.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-lg mx-auto">
              {[
                { title: 'Connect any domain', desc: 'Use your own domain or subdomain' },
                { title: 'Auto SSL', desc: 'HTTPS provisioned automatically' },
                { title: 'DNS guidance', desc: 'Step-by-step setup instructions' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50 rounded-xl p-4 border border-border">
                  <p className="text-xs font-semibold text-[#0F172A] mb-1">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
