import { Helmet } from '@dr.pogodin/react-helmet';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function AvailabilitySettingsPage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Availability Settings — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Availability & Hours</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Control when customers can book appointments</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
            <Save size={16} className="mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-6">
          {/* Booking window */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Booking Window</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Minimum notice period</Label>
                  <Select defaultValue="2h">
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30m">30 minutes</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="2h">2 hours</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                      <SelectItem value="48h">48 hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">How far in advance must customers book?</p>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Advance booking limit</Label>
                  <Select defaultValue="60d">
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">1 week</SelectItem>
                      <SelectItem value="14d">2 weeks</SelectItem>
                      <SelectItem value="30d">1 month</SelectItem>
                      <SelectItem value="60d">2 months</SelectItem>
                      <SelectItem value="90d">3 months</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">How far ahead can customers book?</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Buffer time */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Buffer Time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Before appointment</Label>
                  <Select defaultValue="0">
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">After appointment</Label>
                  <Select defaultValue="10">
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Block out dates */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Block Out Dates</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">Add holidays, time off or any dates when you're unavailable.</p>
              <div className="flex gap-3 mb-4">
                <Input type="date" className="h-10 flex-1" />
                <Input type="date" className="h-10 flex-1" />
                <Button variant="outline" className="shrink-0">Add</Button>
              </div>
              <div className="text-sm text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">
                No blocked dates added yet
              </div>
            </CardContent>
          </Card>

          {/* Cancellation policy */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-[#0F172A]">Cancellation Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Allow customer cancellations</p>
                  <p className="text-xs text-muted-foreground">Customers can cancel their own bookings</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Cancellation notice required</Label>
                <Select defaultValue="24h">
                  <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="2h">2 hours</SelectItem>
                    <SelectItem value="4h">4 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                    <SelectItem value="48h">48 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
