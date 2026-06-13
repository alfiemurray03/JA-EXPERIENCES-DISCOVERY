import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Scissors, Dumbbell, BookOpen, Heart, Home, PawPrint,
  Briefcase, Camera, Users, ChevronDown, ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { businessCategories } from '@/data/businessCategories';
import { useState } from 'react';

const iconMap: Record<string, React.ElementType> = {
  Scissors, Dumbbell, BookOpen, Heart, Home, PawPrint, Briefcase, Camera, Users,
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
};
const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export default function CategoriesPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <>
      <Helmet>
        <title>Business Categories — JABooking</title>
        <meta name="description" content="JABooking supports 9 business categories and 60+ business types. From barbers to personal trainers, tutors to dog groomers — find your industry." />
        <link rel="canonical" href="https://jabooking.jagroupservices.co.uk/categories" />
      </Helmet>

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-slate-50 to-white pt-16 pb-12 text-center">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.p variants={fadeUp} className="text-sm font-semibold text-primary uppercase tracking-widest mb-3">
                All Industries
              </motion.p>
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-[#0F172A] mb-4">
                Built for Every Service Business
              </motion.h1>
              <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
                JABooking supports 9 business categories and 60+ business types across the UK. Whatever your industry, we have you covered.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link to="/register">
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                    Start Free — Choose Your Category
                    <ArrowRight size={18} className="ml-2" />
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="bg-[#0F172A] py-8">
          <div className="container mx-auto px-4 lg:px-6">
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { value: '9', label: 'Business Categories' },
                { value: '60+', label: 'Business Types' },
                { value: '500+', label: 'UK Businesses' },
              ].map((stat, i) => (
                <div key={i}>
                  <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4 lg:px-6">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-5"
            >
              {businessCategories.map((cat) => {
                const Icon = iconMap[cat.icon] || Briefcase;
                const isOpen = expanded === cat.id;

                return (
                  <motion.div
                    key={cat.id}
                    variants={fadeUp}
                    className="border border-border rounded-2xl overflow-hidden hover:border-primary/30 transition-colors"
                  >
                    {/* Category header */}
                    <button
                      onClick={() => setExpanded(isOpen ? null : cat.id)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ backgroundColor: cat.color + '18', color: cat.color }}
                        >
                          <Icon size={24} />
                        </div>
                        <div>
                          <h2 className="font-bold text-[#0F172A] text-lg">{cat.name}</h2>
                          <p className="text-sm text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span
                          className="text-xs font-semibold px-3 py-1 rounded-full"
                          style={{ backgroundColor: cat.color + '18', color: cat.color }}
                        >
                          {cat.types.length} types
                        </span>
                        <ChevronDown
                          size={20}
                          className={`text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        />
                      </div>
                    </button>

                    {/* Expanded types */}
                    {isOpen && (
                      <div className="px-6 pb-6 border-t border-border bg-slate-50/30">
                        <div className="pt-5">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                            Business Types in {cat.name}
                          </p>
                          <div className="flex flex-wrap gap-2 mb-6">
                            {cat.types.map((type) => (
                              <span
                                key={type}
                                className="text-sm px-3 py-1.5 rounded-full border border-border bg-white text-[#0F172A] font-medium hover:border-primary/40 transition-colors"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                          <Link to={`/register?category=${cat.id}`}>
                            <Button
                              size="sm"
                              className="font-semibold"
                              style={{ backgroundColor: cat.color }}
                            >
                              Start with {cat.name}
                              <ArrowRight size={14} className="ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-slate-50 text-center">
          <div className="container mx-auto px-4 lg:px-6">
            <h2 className="text-2xl font-bold text-[#0F172A] mb-4">Don't see your business type?</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're constantly adding new categories. Sign up and let us know what you need.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-8">
                Get Started Free
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
