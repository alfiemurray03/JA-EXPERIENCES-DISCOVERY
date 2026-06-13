import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus, Search, Calendar, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { demoBusiness, type MockAppointment } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-100 text-amber-700 border-amber-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  completed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const paymentColors: Record<string, string> = {
  paid: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  refunded: 'bg-slate-100 text-slate-600',
};

export default function AppointmentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApt, setSelectedApt] = useState<MockAppointment | null>(null);

  const filtered = demoBusiness.appointments.filter((apt) => {
    const matchSearch =
      apt.customerName.toLowerCase().includes(search.toLowerCase()) ||
      apt.service.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || apt.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statuses = ['all', 'confirmed', 'pending', 'completed', 'cancelled'];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Appointments — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Appointments</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage all your bookings</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
            <Plus size={16} className="mr-2" />
            New Appointment
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search appointments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all border ${
                  statusFilter === s
                    ? 'bg-primary text-white border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Appointments list */}
        <Card className="border-border">
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Calendar size={32} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm">No appointments found</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((apt) => (
                  <motion.div
                    key={apt.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedApt(apt)}
                  >
                    <div className="w-16 shrink-0 text-center">
                      <p className="text-sm font-bold text-[#0F172A]">{apt.time}</p>
                      <p className="text-xs text-muted-foreground">{apt.date}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-primary">
                        {apt.customerName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[#0F172A] truncate">{apt.customerName}</p>
                      <p className="text-xs text-muted-foreground truncate">{apt.service} · {apt.staff}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-3 shrink-0">
                      <span className="text-sm font-semibold text-[#0F172A]">£{apt.price}</span>
                      <Badge className={`text-xs capitalize ${statusColors[apt.status]}`}>
                        {apt.status}
                      </Badge>
                      <Badge className={`text-xs capitalize ${paymentColors[apt.paymentStatus]}`}>
                        {apt.paymentStatus}
                      </Badge>
                    </div>
                    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment detail modal */}
        <Dialog open={!!selectedApt} onOpenChange={() => setSelectedApt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Appointment Details</DialogTitle>
            </DialogHeader>
            {selectedApt && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">
                      {selectedApt.customerName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#0F172A]">{selectedApt.customerName}</p>
                    <p className="text-sm text-muted-foreground">{selectedApt.customerEmail}</p>
                    <p className="text-sm text-muted-foreground">{selectedApt.customerPhone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Service</p>
                    <p className="font-medium text-[#0F172A]">{selectedApt.service}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Staff</p>
                    <p className="font-medium text-[#0F172A]">{selectedApt.staff}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Date & Time</p>
                    <p className="font-medium text-[#0F172A]">{selectedApt.date} at {selectedApt.time}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Price</p>
                    <p className="font-medium text-[#0F172A]">£{selectedApt.price}</p>
                  </div>
                </div>
                {selectedApt.notes && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-xs font-semibold text-amber-700 mb-1">Notes</p>
                    <p className="text-sm text-amber-800">{selectedApt.notes}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Badge className={`${statusColors[selectedApt.status]} capitalize`}>{selectedApt.status}</Badge>
                  <Badge className={`${paymentColors[selectedApt.paymentStatus]} capitalize`}>{selectedApt.paymentStatus}</Badge>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 text-sm">Reschedule</Button>
                  <Button variant="outline" className="flex-1 text-sm text-red-600 border-red-200 hover:bg-red-50">Cancel</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
