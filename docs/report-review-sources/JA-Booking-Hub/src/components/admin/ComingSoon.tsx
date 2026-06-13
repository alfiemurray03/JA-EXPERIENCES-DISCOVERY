import { LucideIcon, Rocket } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';

interface ComingSoonProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  features?: string[];
}

export default function ComingSoon({ title, description, icon: Icon = Rocket, features = [] }: ComingSoonProps) {
  return (
    <AdminLayout>
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">JABooking · Admin Portal</p>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
            <Icon size={36} className="text-primary" />
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <Rocket size={12} />
            Coming Soon
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm max-w-md mb-8">{description}</p>

          {features.length > 0 && (
            <div className="bg-slate-50 border border-border rounded-2xl p-6 max-w-sm w-full text-left">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Planned features</p>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-[#0F172A]">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
