export interface ServicePlan {
  id: string;
  plan_name: string;
  plan_type: string;
  price_label: string;
  price_pence: number;
  delivery_time: string;
  revisions: string;
  description: string;
  button_label: string;
  is_featured: number;
  payment_available?: boolean;
}

/** The public JA Plan Studio subscription catalogue. */
export const JA_PLAN_STUDIO_SUBSCRIPTIONS: ServicePlan[] = [
  {
    id: 'personal',
    plan_name: 'JA Plan Studio – Explore',
    plan_type: 'Monthly subscription',
    price_label: '£5.99',
    price_pence: 599,
    delivery_time: 'Essential planning builders',
    revisions: 'Save and revisit your plans',
    description: 'A simple starting point for exploring ideas and building clear, practical plans.',
    button_label: 'Subscribe to Explore',
    is_featured: 0,
  },
  {
    id: 'standard',
    plan_name: 'JA Plan Studio – Plan',
    plan_type: 'Monthly subscription',
    price_label: '£7.99',
    price_pence: 799,
    delivery_time: 'More builders and planning tools',
    revisions: 'Download your finished plans',
    description: 'For regularly creating detailed destination, itinerary, experience and everyday plans.',
    button_label: 'Subscribe to Plan',
    is_featured: 1,
  },
  {
    id: 'professional',
    plan_name: 'JA Plan Studio – Complete',
    plan_type: 'Monthly subscription',
    price_label: '£14.99',
    price_pence: 1499,
    delivery_time: 'Full planning-builder access',
    revisions: 'Enhanced planning and outputs',
    description: 'Complete access for building and managing more comprehensive personalised plans.',
    button_label: 'Subscribe to Complete',
    is_featured: 0,
  },
  {
    id: 'org_starter',
    plan_name: 'JA Plan Studio – Together',
    plan_type: 'Monthly subscription',
    price_label: '£39.99',
    price_pence: 3999,
    delivery_time: 'Shared planning for groups',
    revisions: 'All builders and collaborative tools',
    description: 'Shared planning for households, families and groups who want to build plans together.',
    button_label: 'Subscribe to Together',
    is_featured: 0,
  },
];
