import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar, Users, CreditCard, Plus, Eye,
  Share2, Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

interface AuthUser { name?: string; given_name?: string; email?: string; }

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-slate-100 text-slate-600',
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

export default function DashboardHome() {
  const [user, setUser] = useState<AuthUser | null>(null);
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.authenticated) setUser(data.user); })
      .catch(() => {});
  }, []);

  const firstName = user?.given_name ?? user?.name?.split(' ')[0] ?? 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = demoBusiness.appointments.filter((a) => a.date === today);
  const monthRevenue = demoBusiness.payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    {
      label: "Today's Appointments",
      value: todayAppointments.length || demoBusiness.appointments.length,
      icon: Calendar,
      color: 'bg-indigo-50 text-indigo-600',
      change: '+2 from yesterday',
    },
    {
      label: 'Upcoming This Week',
      value: demoBusiness.appointments.filter((a) => a.status === 'confirmed').length,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600',
      change: '3 pending confirmation',
    },
    {
      label: 'Revenue This Month',
      value: `£${monthRevenue}`,
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600',
      change: '+12% vs last month',
    },
    {
      label: 'Total Customers',
      value: demoBusiness.customers.length,
      icon: Users,
      color: 'bg-pink-50 text-pink-600',
      change: '+3 this month',
    },
  ];

  const quickActions = [
    { label: 'New Appointment', icon: Plus, href: '/dashboard/appointments', color: 'bg-primary text-white' },
    { label: 'Add Service', icon: Plus, href: '/dashboard/services', color: 'bg-emerald-600 text-white' },
    { label: 'View Bookings', icon: Eye, href: '/dashboard/appointments', color: 'bg-slate-700 text-white' },
    { label: 'Share Page', icon: Share2, href: `/b/${demoBusiness.slug}`, color: 'bg-violet-600 text-white' },
  ];

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Welcome */}
        <motion.div initial="hidden" animate="visible" variants={stagger}>
          <motion.div variants={fadeUp} className="mb-8">
            <h1 className="text-2xl font-bold text-[#0F172A]">
              {greeting}, {firstName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your business today.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div key={i} variants={fadeUp}>
                  <Card className="border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                          <Icon size={20} />
                        </div>
                      </div>
                      <p className="text-2xl font-bold text-[#0F172A] mb-0.5">{stat.value}</p>
                      <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                      <p className="text-xs text-emerald-600 font-medium">{stat.change}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={fadeUp} className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              {quickActions.map((action, i) => {
                const Icon = action.icon;
                return (
                  <Link key={i} to={action.href}>
                    <Button className={`${action.color} font-medium text-sm h-9`}>
                      <Icon size={15} className="mr-1.5" />
                      {action.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </motion.div>

          {/* Today's appointments */}
          <motion.div variants={fadeUp} className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-[#0F172A]">Today's Appointments</CardTitle>
                    <Link to="/dashboard/appointments">
                      <Button variant="ghost" size="sm" className="text-xs text-primary">View all</Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {demoBusiness.appointments.length === 0 ? (
                    <div className="px-6 py-8 text-center text-muted-foreground text-sm">
                      No appointments today
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {demoBusiness.appointments.map((apt) => {
                        return (
                          <div key={apt.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                            <div className="text-center shrink-0 w-12">
                              <p className="text-sm font-bold text-[#0F172A]">{apt.time}</p>
                              <p className="text-xs text-muted-foreground">{apt.duration}m</p>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#0F172A] truncate">{apt.customerName}</p>
                              <p className="text-xs text-muted-foreground truncate">{apt.service} · {apt.staff}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-sm font-semibold text-[#0F172A]">£{apt.price}</span>
                              <Badge className={`text-xs ${statusColors[apt.status]}`}>
                                {apt.status}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent activity */}
            <div>
              <Card className="border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-[#0F172A]">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {[
                      { text: 'New booking from James W.', time: '2 min ago', color: 'bg-emerald-500' },
                      { text: 'Payment received — £35', time: '1 hr ago', color: 'bg-indigo-500' },
                      { text: 'New 5-star review', time: '3 hrs ago', color: 'bg-amber-500' },
                      { text: 'Tyrone B. rescheduled', time: '5 hrs ago', color: 'bg-slate-400' },
                      { text: 'New customer: Daniel H.', time: 'Yesterday', color: 'bg-pink-500' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                        <div className="min-w-0">
                          <p className="text-xs text-[#0F172A] font-medium">{item.text}</p>
                          <p className="text-xs text-muted-foreground">{item.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
