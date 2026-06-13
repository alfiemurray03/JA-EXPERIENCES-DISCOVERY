import { Helmet } from '@dr.pogodin/react-helmet';
import { Tag } from 'lucide-react';
import ComingSoon from '@/components/admin/ComingSoon';

export default function AdminCategories() {
  return (
    <>
      <Helmet>
        <title>Categories — Admin | JABooking</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <ComingSoon
        title="Categories & Business Types"
        icon={Tag}
        description="Manage the business categories and types available on the JABooking platform — add new industries, rename types, or retire outdated ones."
        features={[
          'Add, edit, and archive business categories',
          'Manage business types within each category',
          'Set category icons and descriptions',
          'View how many businesses use each category',
          'Control which categories are publicly visible',
        ]}
      />
    </>
  );
}
