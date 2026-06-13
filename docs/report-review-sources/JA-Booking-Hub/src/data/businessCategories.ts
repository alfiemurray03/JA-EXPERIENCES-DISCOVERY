export interface BusinessCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  types: string[];
}

export const businessCategories: BusinessCategory[] = [
  {
    id: 'hair-beauty',
    name: 'Hair & Beauty',
    icon: 'Scissors',
    color: '#EC4899',
    description: 'Salons, barbers, nail techs, lash artists and more',
    types: [
      'Barber',
      'Hair Salon',
      'Mobile Hairdresser',
      'Beauty Salon',
      'Nail Technician',
      'Lash Technician',
      'Brow Technician',
      'Makeup Artist',
      'Aesthetic Practitioner',
      'Massage Therapist',
      'Tanning Salon',
    ],
  },
  {
    id: 'fitness-sport',
    name: 'Fitness & Sport',
    icon: 'Dumbbell',
    color: '#F97316',
    description: 'Personal trainers, coaches, instructors and sports professionals',
    types: [
      'Personal Trainer',
      'Online Fitness Coach',
      'Gym Instructor',
      'Yoga Instructor',
      'Pilates Instructor',
      'Boxing Coach',
      'Martial Arts Instructor',
      'Running Coach',
      'Swimming Coach',
      'Football Coach',
      'Tennis Coach',
      'Golf Coach',
      'Strength & Conditioning Coach',
      'Weight Loss Coach',
      'Sports Therapist',
    ],
  },
  {
    id: 'education-training',
    name: 'Education & Training',
    icon: 'BookOpen',
    color: '#3B82F6',
    description: 'Tutors, teachers, instructors and academic coaches',
    types: [
      'Tutor',
      'Language Teacher',
      'Music Teacher',
      'Driving Instructor',
      'Academic Coach',
      'Exam Preparation Tutor',
      'Computer Trainer',
    ],
  },
  {
    id: 'health-wellbeing',
    name: 'Health & Wellbeing',
    icon: 'Heart',
    color: '#10B981',
    description: 'Counsellors, life coaches, wellness and holistic practitioners',
    types: [
      'Counsellor',
      'Life Coach',
      'Wellness Coach',
      'Nutrition Coach',
      'Meditation Instructor',
      'Hypnotherapist',
    ],
  },
  {
    id: 'home-services',
    name: 'Home Services',
    icon: 'Home',
    color: '#8B5CF6',
    description: 'Cleaners, gardeners, tradespeople and home maintenance',
    types: [
      'Cleaner',
      'Gardener',
      'Handyman',
      'Electrician',
      'Plumber',
      'Painter & Decorator',
      'Window Cleaner',
      'Carpet Cleaner',
    ],
  },
  {
    id: 'pet-services',
    name: 'Pet Services',
    icon: 'PawPrint',
    color: '#F59E0B',
    description: 'Dog groomers, walkers, sitters and pet care professionals',
    types: ['Dog Groomer', 'Dog Walker', 'Pet Sitter', 'Pet Trainer', 'Pet Day Care'],
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    icon: 'Briefcase',
    color: '#6366F1',
    description: 'Consultants, accountants, advisers and business professionals',
    types: [
      'Consultant',
      'Accountant',
      'Bookkeeper',
      'Tax Adviser',
      'Business Coach',
      'Marketing Consultant',
      'Recruitment Consultant',
    ],
  },
  {
    id: 'events-entertainment',
    name: 'Events & Entertainment',
    icon: 'Camera',
    color: '#EF4444',
    description: 'Photographers, DJs, event planners and entertainers',
    types: [
      'DJ',
      'Photographer',
      'Videographer',
      'Event Planner',
      'Wedding Planner',
      'Entertainer',
      "Children's Party Host",
    ],
  },
  {
    id: 'community-faith',
    name: 'Community & Faith',
    icon: 'Users',
    color: '#14B8A6',
    description: 'Churches, charities, community groups and volunteer organisations',
    types: ['Church', 'Community Group', 'Charity', 'Youth Group', 'Volunteer Organisation'],
  },
];

export function getCategoryById(id: string): BusinessCategory | undefined {
  return businessCategories.find((c) => c.id === id);
}

export function getCategoryByType(type: string): BusinessCategory | undefined {
  return businessCategories.find((c) => c.types.includes(type));
}
