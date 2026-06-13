import { Helmet } from '@dr.pogodin/react-helmet';
import { Users } from 'lucide-react';
import ComingSoon from '@/components/admin/ComingSoon';

export default function AdminUsers() {
  return (
    <>
      <Helmet>
        <title>Users — Admin | JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ComingSoon
        title="User Management"
        icon={Users}
        description="View and manage all registered business owners, staff members, and customers across the JABooking platform."
        features={[
          'Search and filter users by role, plan, or status',
          'View user profile, login history, and linked businesses',
          'Suspend or reactivate accounts',
          'Reset passwords and manage 2FA',
          'Export user data for compliance',
        ]}
      />
    </>
  );
}
