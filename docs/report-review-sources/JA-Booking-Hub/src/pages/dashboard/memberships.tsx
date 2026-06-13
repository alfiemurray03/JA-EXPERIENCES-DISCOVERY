import { Helmet } from '@dr.pogodin/react-helmet';
import { Award, Plus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function MembershipsPage() {
  const isBusinessPlan = false; // demo: not on business plan

  return (
    <DashboardLayout>
      <Helmet>
        <title>Memberships — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Memberships</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Offer recurring membership packages to your customers</p>
          </div>
          {isBusinessPlan && (
            <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
              <Plus size={16} className="mr-2" />
              Create Membership
            </Button>
          )}
        </div>

        {!isBusinessPlan ? (
          <Card className="border-border">
            <CardContent className="p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-amber-600" />
              </div>
              <h2 className="text-lg font-bold text-[#0F172A] mb-2">Memberships — Business Plan Feature</h2>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
                Create recurring membership packages, monthly passes and subscription plans for your customers. Available on the Business plan.
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
          <div className="text-center py-16 text-muted-foreground">
            <Award size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No memberships created yet</p>
            <Button className="mt-4 bg-primary text-white">Create Your First Membership</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
