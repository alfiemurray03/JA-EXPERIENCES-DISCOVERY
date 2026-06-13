import { Helmet } from '@dr.pogodin/react-helmet';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function LoyaltyPage() {
  const isBusinessPlan = false;
  const totalPoints = demoBusiness.customers.reduce((s, c) => s + c.loyaltyPoints, 0);

  return (
    <DashboardLayout>
      <Helmet>
        <title>Loyalty Points — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Loyalty Points</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Reward your loyal customers and keep them coming back</p>
        </div>

        {!isBusinessPlan ? (
          <Card className="border-border">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-violet-600" />
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-2">Loyalty Programme — Business Plan Feature</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Reward customers with points for every booking. Let them redeem points for discounts, free services or special perks. Available on the Business plan.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/dashboard/settings/billing">
                  <Button className="bg-primary hover:bg-primary/90 text-white font-semibold">
                    Upgrade to Business — £39.99/mo
                  </Button>
                </Link>
                <Link to="/pricing">
                  <Button variant="outline">View All Plans</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="border-border">
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-indigo-600">{totalPoints}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Points Issued</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
