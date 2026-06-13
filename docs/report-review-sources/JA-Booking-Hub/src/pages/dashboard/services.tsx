import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Plus, Clock, PoundSterling, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { demoBusiness, type MockService } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function ServicesPage() {
  const [services, setServices] = useState<MockService[]>(demoBusiness.services);
  const [showModal, setShowModal] = useState(false);
  const [editService, setEditService] = useState<MockService | null>(null);

  const toggleActive = (id: string) => {
    setServices(services.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const openAdd = () => { setEditService(null); setShowModal(true); };
  const openEdit = (svc: MockService) => { setEditService(svc); setShowModal(true); };

  return (
    <DashboardLayout>
      <Helmet>
        <title>Services — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Services</h1>
            <p className="text-muted-foreground text-sm mt-0.5">{services.length} services · {services.filter(s => s.active).length} active</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium" onClick={openAdd}>
            <Plus size={16} className="mr-2" />
            Add Service
          </Button>
        </div>

        <div className="space-y-3">
          {services.map((svc) => (
            <Card key={svc.id} className={`border-border transition-all ${!svc.active ? 'opacity-60' : ''}`}>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[#0F172A]">{svc.name}</h3>
                      {!svc.active && <Badge className="bg-slate-100 text-slate-500 text-xs">Inactive</Badge>}
                      {svc.depositRequired && (
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">Deposit required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{svc.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock size={14} />
                        {svc.duration} min
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-[#0F172A]">
                        <PoundSterling size={14} />
                        {svc.price}
                      </span>
                      {svc.depositRequired && svc.depositAmount && (
                        <span className="text-xs text-indigo-600">
                          £{svc.depositAmount} deposit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Switch
                      checked={svc.active}
                      onCheckedChange={() => toggleActive(svc.id)}
                      aria-label={`Toggle ${svc.name}`}
                    />
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEdit(svc)}>
                      <Edit2 size={15} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-600 hover:bg-red-50">
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add/Edit modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Service name *</Label>
                <Input defaultValue={editService?.name} placeholder="e.g. Skin Fade" className="h-10" />
              </div>
              <div>
                <Label className="text-sm font-medium mb-1.5 block">Description</Label>
                <Input defaultValue={editService?.description} placeholder="Brief description" className="h-10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Duration (minutes)</Label>
                  <Input type="number" defaultValue={editService?.duration} placeholder="45" className="h-10" />
                </div>
                <div>
                  <Label className="text-sm font-medium mb-1.5 block">Price (£)</Label>
                  <Input type="number" defaultValue={editService?.price} placeholder="25" className="h-10" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-[#0F172A]">Require deposit</p>
                  <p className="text-xs text-muted-foreground">Customers pay a deposit to confirm</p>
                </div>
                <Switch defaultChecked={editService?.depositRequired} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button className="flex-1 bg-primary text-white" onClick={() => setShowModal(false)}>
                  {editService ? 'Save Changes' : 'Add Service'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
