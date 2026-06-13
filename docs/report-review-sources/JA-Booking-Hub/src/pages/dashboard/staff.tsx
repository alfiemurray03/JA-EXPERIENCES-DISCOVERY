import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

const avatarColors = ['bg-indigo-600', 'bg-emerald-600', 'bg-pink-600', 'bg-amber-600', 'bg-violet-600'];

export default function StaffPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Staff — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Staff</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{demoBusiness.staff.length} team members</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium" onClick={() => setShowModal(true)}>
            <Plus size={16} className="mr-2" />
            Add Staff Member
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {demoBusiness.staff.map((member, i) => (
            <Card key={member.id} className="border-border hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                    {member.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[#0F172A]">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                      <Badge className={member.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}>
                        {member.status}
                      </Badge>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-muted-foreground mb-2">Services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {member.services.slice(0, 3).map((svcId) => {
                          const svc = demoBusiness.services.find(s => s.id === svcId);
                          return svc ? (
                            <span key={svcId} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                              {svc.name}
                            </span>
                          ) : null;
                        })}
                        {member.services.length > 3 && (
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                            +{member.services.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        <Edit2 size={12} className="mr-1" /> Edit
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs h-8">
                        View Schedule
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Staff Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">First name</Label>
                  <Input placeholder="First name" className="h-10" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Last name</Label>
                  <Input placeholder="Last name" className="h-10" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Email</Label>
                <Input type="email" placeholder="staff@yourbusiness.co.uk" className="h-10" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Role / Job title</Label>
                <Input placeholder="e.g. Senior Barber" className="h-10" />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-primary text-white" onClick={() => setShowModal(false)}>Add Staff Member</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
