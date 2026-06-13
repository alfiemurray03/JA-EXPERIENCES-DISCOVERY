import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Save, Upload, Instagram, Facebook, Globe, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function ProfileSettingsPage() {
  const [hours, setHours] = useState(demoBusiness.openingHours);

  const toggleDay = (day: string) => {
    setHours(hours.map(h => h.day === day ? { ...h, open: !h.open } : h));
  };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Business Profile — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Business Profile</h1>
            <p className="text-muted-foreground text-sm mt-0.5">This information appears on your public booking page</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Logo & Cover */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Logo & Cover Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {demoBusiness.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0F172A] mb-1">Business Logo</p>
                  <Button variant="outline" size="sm" className="text-xs">
                    <Upload size={13} className="mr-1.5" />
                    Upload Logo
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A] mb-2">Cover Photo</p>
                <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center">
                  <Button variant="outline" size="sm" className="text-xs bg-white/90 hover:bg-white">
                    <Upload size={13} className="mr-1.5" />
                    Change Cover Photo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business info */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Business Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Business name</Label>
                <Input defaultValue={demoBusiness.name} className="h-10" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">About / Description</Label>
                <Textarea defaultValue={demoBusiness.description} className="min-h-[100px] text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Phone</Label>
                  <Input defaultValue={demoBusiness.phone} className="h-10" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Email</Label>
                  <Input defaultValue={demoBusiness.email} className="h-10" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Address</Label>
                <Input defaultValue={demoBusiness.address} className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">City</Label>
                  <Input defaultValue={demoBusiness.city} className="h-10" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Postcode</Label>
                  <Input defaultValue={demoBusiness.postcode} className="h-10" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Opening hours */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Opening Hours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {hours.map((h) => (
                <div key={h.day} className="flex items-center gap-4">
                  <div className="w-24 shrink-0">
                    <p className="text-sm font-medium text-[#0F172A]">{h.day.slice(0, 3)}</p>
                  </div>
                  <Switch checked={h.open} onCheckedChange={() => toggleDay(h.day)} />
                  {h.open ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input defaultValue={h.from} className="h-8 text-sm w-24" />
                      <span className="text-muted-foreground text-sm">to</span>
                      <Input defaultValue={h.to} className="h-8 text-sm w-24" />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Closed</span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Social links */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Social Media Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/yourbusiness' },
                { label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/yourbusiness' },
                { label: 'Website', icon: Globe, placeholder: 'https://yourbusiness.co.uk' },
                { label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@yourbusiness' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <div key={social.label} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                      <Icon size={16} className="text-slate-600" />
                    </div>
                    <Input placeholder={social.placeholder} className="h-10 flex-1" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
