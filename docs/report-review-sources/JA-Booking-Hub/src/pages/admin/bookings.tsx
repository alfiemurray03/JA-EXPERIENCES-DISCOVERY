import { Helmet } from '@dr.pogodin/react-helmet';
import { Calendar } from 'lucide-react';
import ComingSoon from '@/components/admin/ComingSoon';

export default function AdminBookings() {
  return (
    <>
      <Helmet>
        <title>Bookings — Admin | JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ComingSoon
        title="Platform Bookings"
        icon={Calendar}
        description="A platform-wide view of all bookings made across every business on JABooking — monitor volume, spot issues, and investigate disputes."
        features={[
          'Search bookings by business, customer, or date',
          'View booking status: confirmed, cancelled, no-show',
          'Investigate disputed or flagged bookings',
          'Platform-wide booking volume charts',
          'Export booking data for reporting',
        ]}
      />
    </>
  );
}
