export interface MockService {
  id: string;
  name: string;
  duration: number; // minutes
  price: number;
  depositRequired: boolean;
  depositAmount?: number;
  description: string;
  active: boolean;
}

export interface MockStaff {
  id: string;
  name: string;
  role: string;
  initials: string;
  services: string[];
  status: 'active' | 'inactive';
}

export interface MockReview {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  reply?: string;
}

export interface MockAppointment {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  staff: string;
  date: string;
  time: string;
  duration: number;
  price: number;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  paymentStatus: 'paid' | 'pending' | 'refunded';
  notes?: string;
}

export interface MockCustomer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  lastVisit: string;
  totalSpent: number;
  loyaltyPoints: number;
  notes?: string;
}

export interface MockPayment {
  id: string;
  date: string;
  customerName: string;
  service: string;
  amount: number;
  type: 'deposit' | 'full';
  status: 'paid' | 'pending' | 'refunded';
  reference: string;
}

export interface MockBusiness {
  id: string;
  slug: string;
  name: string;
  category: string;
  type: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postcode: string;
  rating: number;
  reviewCount: number;
  plan: 'free' | 'starter' | 'professional' | 'business';
  subdomain: string;
  services: MockService[];
  staff: MockStaff[];
  reviews: MockReview[];
  appointments: MockAppointment[];
  customers: MockCustomer[];
  payments: MockPayment[];
  openingHours: { day: string; open: boolean; from: string; to: string }[];
  socialLinks: { platform: string; url: string }[];
}

// ─── Sample Business 1: Barber ───────────────────────────────────────────────
const barberBusiness: MockBusiness = {
  id: 'biz-001',
  slug: 'marcus-cuts',
  name: "Marcus Cuts",
  category: 'hair-beauty',
  type: 'Barber',
  description:
    "Premium barbershop in the heart of Birmingham. Specialising in fades, skin fades, beard trims and classic cuts. Walk-ins welcome, appointments preferred.",
  phone: '0121 456 7890',
  email: 'hello@marcuscuts.co.uk',
  address: '14 High Street',
  city: 'Birmingham',
  postcode: 'B1 1AA',
  rating: 4.9,
  reviewCount: 127,
  plan: 'professional',
  subdomain: 'marcus-cuts',
  services: [
    {
      id: 'svc-001',
      name: 'Skin Fade',
      duration: 45,
      price: 25,
      depositRequired: false,
      description: 'Classic skin fade with razor finish',
      active: true,
    },
    {
      id: 'svc-002',
      name: 'Haircut & Beard Trim',
      duration: 60,
      price: 35,
      depositRequired: false,
      description: 'Full haircut with beard shape and trim',
      active: true,
    },
    {
      id: 'svc-003',
      name: 'Beard Trim Only',
      duration: 30,
      price: 15,
      depositRequired: false,
      description: 'Beard shape, trim and line up',
      active: true,
    },
    {
      id: 'svc-004',
      name: 'Hot Towel Shave',
      duration: 45,
      price: 30,
      depositRequired: true,
      depositAmount: 10,
      description: 'Traditional hot towel straight razor shave',
      active: true,
    },
  ],
  staff: [
    {
      id: 'staff-001',
      name: 'Marcus Thompson',
      role: 'Owner & Senior Barber',
      initials: 'MT',
      services: ['svc-001', 'svc-002', 'svc-003', 'svc-004'],
      status: 'active',
    },
    {
      id: 'staff-002',
      name: 'Jordan Clarke',
      role: 'Barber',
      initials: 'JC',
      services: ['svc-001', 'svc-002', 'svc-003'],
      status: 'active',
    },
  ],
  reviews: [
    {
      id: 'rev-001',
      customerName: 'James W.',
      rating: 5,
      comment:
        'Best barber in Birmingham, hands down. Marcus always delivers a perfect fade. Been coming here for 2 years.',
      date: '2026-06-01',
    },
    {
      id: 'rev-002',
      customerName: 'Tyrone B.',
      rating: 5,
      comment: 'Clean shop, great vibes, even better cuts. Jordan did my fade today — immaculate.',
      date: '2026-05-28',
    },
    {
      id: 'rev-003',
      customerName: 'Daniel H.',
      rating: 4,
      comment: 'Really good service. Booked online which was super easy. Will be back.',
      date: '2026-05-20',
    },
  ],
  appointments: [
    {
      id: 'apt-001',
      customerName: 'James Wilson',
      customerEmail: 'james@example.com',
      customerPhone: '07700 900001',
      service: 'Skin Fade',
      staff: 'Marcus Thompson',
      date: '2026-06-07',
      time: '10:00',
      duration: 45,
      price: 25,
      status: 'confirmed',
      paymentStatus: 'pending',
    },
    {
      id: 'apt-002',
      customerName: 'Tyrone Brown',
      customerEmail: 'tyrone@example.com',
      customerPhone: '07700 900002',
      service: 'Haircut & Beard Trim',
      staff: 'Jordan Clarke',
      date: '2026-06-07',
      time: '11:00',
      duration: 60,
      price: 35,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
    {
      id: 'apt-003',
      customerName: 'Daniel Harris',
      customerEmail: 'daniel@example.com',
      customerPhone: '07700 900003',
      service: 'Hot Towel Shave',
      staff: 'Marcus Thompson',
      date: '2026-06-07',
      time: '14:00',
      duration: 45,
      price: 30,
      status: 'pending',
      paymentStatus: 'paid',
      notes: 'First time customer',
    },
  ],
  customers: [
    {
      id: 'cust-001',
      name: 'James Wilson',
      email: 'james@example.com',
      phone: '07700 900001',
      totalBookings: 24,
      lastVisit: '2026-06-01',
      totalSpent: 600,
      loyaltyPoints: 120,
    },
    {
      id: 'cust-002',
      name: 'Tyrone Brown',
      email: 'tyrone@example.com',
      phone: '07700 900002',
      totalBookings: 18,
      lastVisit: '2026-05-28',
      totalSpent: 450,
      loyaltyPoints: 90,
    },
    {
      id: 'cust-003',
      name: 'Daniel Harris',
      email: 'daniel@example.com',
      phone: '07700 900003',
      totalBookings: 6,
      lastVisit: '2026-05-20',
      totalSpent: 150,
      loyaltyPoints: 30,
    },
  ],
  payments: [
    {
      id: 'pay-001',
      date: '2026-06-01',
      customerName: 'James Wilson',
      service: 'Skin Fade',
      amount: 25,
      type: 'full',
      status: 'paid',
      reference: 'JBH-001-001',
    },
    {
      id: 'pay-002',
      date: '2026-05-28',
      customerName: 'Tyrone Brown',
      service: 'Haircut & Beard Trim',
      amount: 35,
      type: 'full',
      status: 'paid',
      reference: 'JBH-001-002',
    },
    {
      id: 'pay-003',
      date: '2026-05-20',
      customerName: 'Daniel Harris',
      service: 'Hot Towel Shave',
      amount: 10,
      type: 'deposit',
      status: 'paid',
      reference: 'JBH-001-003',
    },
  ],
  openingHours: [
    { day: 'Monday', open: true, from: '09:00', to: '18:00' },
    { day: 'Tuesday', open: true, from: '09:00', to: '18:00' },
    { day: 'Wednesday', open: true, from: '09:00', to: '18:00' },
    { day: 'Thursday', open: true, from: '09:00', to: '20:00' },
    { day: 'Friday', open: true, from: '09:00', to: '20:00' },
    { day: 'Saturday', open: true, from: '08:00', to: '17:00' },
    { day: 'Sunday', open: false, from: '', to: '' },
  ],
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/marcuscuts' },
    { platform: 'Facebook', url: 'https://facebook.com/marcuscuts' },
  ],
};

// ─── Sample Business 2: Personal Trainer ────────────────────────────────────
const ptBusiness: MockBusiness = {
  id: 'biz-002',
  slug: 'sarah-fit',
  name: 'Sarah Fit',
  category: 'fitness-sport',
  type: 'Personal Trainer',
  description:
    'London-based personal trainer specialising in weight loss, strength training and body transformation. Online and in-person sessions available. 10+ years experience.',
  phone: '07800 123456',
  email: 'sarah@sarahfit.co.uk',
  address: 'Canary Wharf Gym, 1 Canada Square',
  city: 'London',
  postcode: 'E14 5AB',
  rating: 4.8,
  reviewCount: 89,
  plan: 'professional',
  subdomain: 'sarah-fit',
  services: [
    {
      id: 'svc-010',
      name: '1-to-1 PT Session (60 min)',
      duration: 60,
      price: 65,
      depositRequired: true,
      depositAmount: 20,
      description: 'Personalised one-to-one training session',
      active: true,
    },
    {
      id: 'svc-011',
      name: 'Online Coaching (Monthly)',
      duration: 30,
      price: 120,
      depositRequired: false,
      description: 'Monthly online coaching with weekly check-ins',
      active: true,
    },
    {
      id: 'svc-012',
      name: 'Fitness Assessment',
      duration: 90,
      price: 45,
      depositRequired: false,
      description: 'Full fitness assessment and goal-setting session',
      active: true,
    },
  ],
  staff: [
    {
      id: 'staff-010',
      name: 'Sarah Khan',
      role: 'Head Personal Trainer',
      initials: 'SK',
      services: ['svc-010', 'svc-011', 'svc-012'],
      status: 'active',
    },
  ],
  reviews: [
    {
      id: 'rev-010',
      customerName: 'Emma T.',
      rating: 5,
      comment:
        'Sarah completely transformed my fitness. Lost 2 stone in 4 months. Highly recommend!',
      date: '2026-05-30',
    },
    {
      id: 'rev-011',
      customerName: 'Michael R.',
      rating: 5,
      comment: 'Best PT I have ever had. Knowledgeable, motivating and really listens to your goals.',
      date: '2026-05-15',
    },
  ],
  appointments: [
    {
      id: 'apt-010',
      customerName: 'Emma Taylor',
      customerEmail: 'emma@example.com',
      customerPhone: '07700 900010',
      service: '1-to-1 PT Session (60 min)',
      staff: 'Sarah Khan',
      date: '2026-06-07',
      time: '07:00',
      duration: 60,
      price: 65,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
    {
      id: 'apt-011',
      customerName: 'Michael Roberts',
      customerEmail: 'michael@example.com',
      customerPhone: '07700 900011',
      service: '1-to-1 PT Session (60 min)',
      staff: 'Sarah Khan',
      date: '2026-06-07',
      time: '09:00',
      duration: 60,
      price: 65,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
  ],
  customers: [
    {
      id: 'cust-010',
      name: 'Emma Taylor',
      email: 'emma@example.com',
      phone: '07700 900010',
      totalBookings: 32,
      lastVisit: '2026-06-01',
      totalSpent: 2080,
      loyaltyPoints: 416,
    },
    {
      id: 'cust-011',
      name: 'Michael Roberts',
      email: 'michael@example.com',
      phone: '07700 900011',
      totalBookings: 16,
      lastVisit: '2026-05-28',
      totalSpent: 1040,
      loyaltyPoints: 208,
    },
  ],
  payments: [
    {
      id: 'pay-010',
      date: '2026-06-01',
      customerName: 'Emma Taylor',
      service: '1-to-1 PT Session',
      amount: 65,
      type: 'full',
      status: 'paid',
      reference: 'JBH-002-001',
    },
  ],
  openingHours: [
    { day: 'Monday', open: true, from: '06:00', to: '20:00' },
    { day: 'Tuesday', open: true, from: '06:00', to: '20:00' },
    { day: 'Wednesday', open: true, from: '06:00', to: '20:00' },
    { day: 'Thursday', open: true, from: '06:00', to: '20:00' },
    { day: 'Friday', open: true, from: '06:00', to: '18:00' },
    { day: 'Saturday', open: true, from: '08:00', to: '14:00' },
    { day: 'Sunday', open: false, from: '', to: '' },
  ],
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/sarahfit' },
    { platform: 'TikTok', url: 'https://tiktok.com/@sarahfit' },
  ],
};

// ─── Sample Business 3: Dog Groomer ─────────────────────────────────────────
const dogGroomerBusiness: MockBusiness = {
  id: 'biz-003',
  slug: 'priyas-paws',
  name: "Priya's Paws",
  category: 'pet-services',
  type: 'Dog Groomer',
  description:
    'Professional dog grooming salon in Manchester. We treat every dog like our own. Specialising in all breeds, from tiny Chihuahuas to large Golden Retrievers.',
  phone: '0161 789 0123',
  email: 'hello@priyaspaws.co.uk',
  address: '22 Deansgate',
  city: 'Manchester',
  postcode: 'M3 4LY',
  rating: 4.9,
  reviewCount: 203,
  plan: 'business',
  subdomain: 'priyas-paws',
  services: [
    {
      id: 'svc-020',
      name: 'Full Groom (Small Dog)',
      duration: 90,
      price: 45,
      depositRequired: true,
      depositAmount: 15,
      description: 'Bath, dry, trim, nail clip and ear clean for small breeds',
      active: true,
    },
    {
      id: 'svc-021',
      name: 'Full Groom (Medium Dog)',
      duration: 120,
      price: 60,
      depositRequired: true,
      depositAmount: 20,
      description: 'Bath, dry, trim, nail clip and ear clean for medium breeds',
      active: true,
    },
    {
      id: 'svc-022',
      name: 'Full Groom (Large Dog)',
      duration: 150,
      price: 75,
      depositRequired: true,
      depositAmount: 25,
      description: 'Bath, dry, trim, nail clip and ear clean for large breeds',
      active: true,
    },
    {
      id: 'svc-023',
      name: 'Bath & Dry Only',
      duration: 60,
      price: 30,
      depositRequired: false,
      description: 'Shampoo, condition and blow dry',
      active: true,
    },
    {
      id: 'svc-024',
      name: 'Nail Clip Only',
      duration: 15,
      price: 12,
      depositRequired: false,
      description: 'Quick nail trim and file',
      active: true,
    },
  ],
  staff: [
    {
      id: 'staff-020',
      name: 'Priya Mehta',
      role: 'Owner & Senior Groomer',
      initials: 'PM',
      services: ['svc-020', 'svc-021', 'svc-022', 'svc-023', 'svc-024'],
      status: 'active',
    },
    {
      id: 'staff-021',
      name: 'Chloe Davies',
      role: 'Dog Groomer',
      initials: 'CD',
      services: ['svc-020', 'svc-021', 'svc-023', 'svc-024'],
      status: 'active',
    },
  ],
  reviews: [
    {
      id: 'rev-020',
      customerName: 'Sophie L.',
      rating: 5,
      comment:
        'My Cockapoo always comes out looking amazing. The automated reminders are so helpful — never miss an appointment now.',
      date: '2026-06-02',
    },
    {
      id: 'rev-021',
      customerName: 'Ahmed K.',
      rating: 5,
      comment:
        'Priya is brilliant with my nervous Labrador. He actually looks forward to going now!',
      date: '2026-05-25',
    },
    {
      id: 'rev-022',
      customerName: 'Rachel P.',
      rating: 4,
      comment: 'Great service, easy to book online. My Golden Retriever looks stunning.',
      date: '2026-05-18',
    },
  ],
  appointments: [
    {
      id: 'apt-020',
      customerName: 'Sophie Lewis',
      customerEmail: 'sophie@example.com',
      customerPhone: '07700 900020',
      service: 'Full Groom (Small Dog)',
      staff: 'Priya Mehta',
      date: '2026-06-07',
      time: '09:00',
      duration: 90,
      price: 45,
      status: 'confirmed',
      paymentStatus: 'paid',
      notes: 'Cockapoo — Biscuit. Nervous around clippers.',
    },
    {
      id: 'apt-021',
      customerName: 'Ahmed Khan',
      customerEmail: 'ahmed@example.com',
      customerPhone: '07700 900021',
      service: 'Full Groom (Large Dog)',
      staff: 'Chloe Davies',
      date: '2026-06-07',
      time: '11:00',
      duration: 150,
      price: 75,
      status: 'confirmed',
      paymentStatus: 'paid',
    },
  ],
  customers: [
    {
      id: 'cust-020',
      name: 'Sophie Lewis',
      email: 'sophie@example.com',
      phone: '07700 900020',
      totalBookings: 28,
      lastVisit: '2026-06-02',
      totalSpent: 1260,
      loyaltyPoints: 252,
    },
    {
      id: 'cust-021',
      name: 'Ahmed Khan',
      email: 'ahmed@example.com',
      phone: '07700 900021',
      totalBookings: 15,
      lastVisit: '2026-05-25',
      totalSpent: 1125,
      loyaltyPoints: 225,
    },
  ],
  payments: [
    {
      id: 'pay-020',
      date: '2026-06-02',
      customerName: 'Sophie Lewis',
      service: 'Full Groom (Small Dog)',
      amount: 45,
      type: 'full',
      status: 'paid',
      reference: 'JBH-003-001',
    },
    {
      id: 'pay-021',
      date: '2026-05-25',
      customerName: 'Ahmed Khan',
      service: 'Full Groom (Large Dog)',
      amount: 25,
      type: 'deposit',
      status: 'paid',
      reference: 'JBH-003-002',
    },
  ],
  openingHours: [
    { day: 'Monday', open: true, from: '08:00', to: '17:00' },
    { day: 'Tuesday', open: true, from: '08:00', to: '17:00' },
    { day: 'Wednesday', open: true, from: '08:00', to: '17:00' },
    { day: 'Thursday', open: true, from: '08:00', to: '17:00' },
    { day: 'Friday', open: true, from: '08:00', to: '17:00' },
    { day: 'Saturday', open: true, from: '09:00', to: '15:00' },
    { day: 'Sunday', open: false, from: '', to: '' },
  ],
  socialLinks: [
    { platform: 'Instagram', url: 'https://instagram.com/priyaspaws' },
    { platform: 'Facebook', url: 'https://facebook.com/priyaspaws' },
    { platform: 'TikTok', url: 'https://tiktok.com/@priyaspaws' },
  ],
};

export const mockBusinesses: MockBusiness[] = [barberBusiness, ptBusiness, dogGroomerBusiness];

export function getMockBusinessBySlug(slug: string): MockBusiness | undefined {
  return mockBusinesses.find((b) => b.slug === slug);
}

// Default demo business for dashboard
export const demoBusiness = barberBusiness;
