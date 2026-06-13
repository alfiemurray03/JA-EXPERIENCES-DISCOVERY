import { Helmet } from '@dr.pogodin/react-helmet';
import { CreditCard } from 'lucide-react';
import ComingSoon from '@/components/admin/ComingSoon';

export default function AdminBilling() {
  return (
    <>
      <Helmet>
        <title>Plans & Billing — Admin | JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ComingSoon
        title="Plans & Billing"
        icon={CreditCard}
        description="Monitor subscriptions, revenue, failed payments, and manage plan pricing across the JABooking platform."
        features={[
          'Live MRR and ARR tracking by plan tier',
          'View all active, trialling, and cancelled subscriptions',
          'Retry failed payments and view Stripe events',
          'Issue refunds and apply manual credits',
          'Edit plan pricing and feature limits',
          'Revenue reports and churn analytics',
        ]}
      />
    </>
  );
}
