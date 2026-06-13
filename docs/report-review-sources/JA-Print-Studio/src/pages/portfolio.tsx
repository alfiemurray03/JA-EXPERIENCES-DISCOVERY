import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } };

const FILTERS = ['All', 'Business Cards', 'Flyers', 'Posters', 'Banners', 'Stickers', 'Menus', 'Branding'];

// Static seed items shown before any DB data loads
const seedItems = [
  { id: '1', title: 'Prestige Business Cards', productType: 'Business Cards', description: 'Soft-touch laminate with spot UV finish on 600gsm board', finishDetails: 'Soft-Touch + Spot UV', gradient: 'from-slate-900 to-slate-700', tags: ['Business Cards'] },
  { id: '2', title: 'Event Branding Suite', productType: 'Flyers', description: 'Full event collateral — A5 flyers, A2 posters, roll-up banners', finishDetails: 'Gloss Laminate', gradient: 'from-blue-900 to-blue-700', tags: ['Flyers', 'Posters', 'Banners'] },
  { id: '3', title: 'Restaurant Menu Collection', productType: 'Menus', description: 'Premium laminated menus with custom die-cut corners', finishDetails: 'Matte Laminate', gradient: 'from-zinc-800 to-zinc-600', tags: ['Menus'] },
  { id: '4', title: 'Brand Identity Stickers', productType: 'Stickers', description: 'Custom die-cut vinyl stickers on clear and white stock', finishDetails: 'Clear Vinyl', gradient: 'from-indigo-900 to-indigo-700', tags: ['Stickers'] },
  { id: '5', title: 'Corporate Brochure', productType: 'Branding', description: 'A4 saddle-stitched brochure with soft-touch cover', finishDetails: 'Soft-Touch Cover', gradient: 'from-gray-900 to-gray-700', tags: ['Branding'] },
  { id: '6', title: 'Exhibition Banners', productType: 'Banners', description: 'Set of 3 roll-up banners for trade show stand', finishDetails: 'Matte PVC', gradient: 'from-sky-900 to-sky-700', tags: ['Banners'] },
];

interface PortfolioItem {
  id: string;
  title: string;
  productType: string;
  description?: string | null;
  finishDetails?: string | null;
  imageUrl?: string | null;
  tags?: string[] | null;
  gradient?: string;
}

export default function PortfolioPage() {
  const [filter, setFilter] = useState('All');
  const [items, setItems] = useState<PortfolioItem[]>(seedItems);

  useEffect(() => {
    fetch('/api/portfolio')
      .then((r) => r.json())
      .then((data: PortfolioItem[]) => {
        if (Array.isArray(data) && data.length > 0) {
          setItems(data.map((item, i) => ({
            ...item,
            gradient: seedItems[i % seedItems.length].gradient,
          })));
        }
      })
      .catch(() => {});
  }, []);

  const filtered = filter === 'All'
    ? items
    : items.filter((item) =>
        item.productType === filter ||
        (item.tags && item.tags.includes(filter))
      );

  return (
    <>
      <title>Portfolio — JA Print Studio</title>
      <meta name="description" content="Recent print work from JA Print Studio — business cards, flyers, posters, banners, stickers, menus, and more." />

      {/* Hero */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">Recent Work</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl lg:text-7xl font-heading font-bold text-background leading-none mb-4">
              Portfolio
            </motion.h1>
            <motion.p variants={fadeUp} className="text-background/50 text-lg max-w-xl">
              A selection of recent print projects. Every job is custom — these are just examples of what we can do.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Filter */}
      <section className="sticky top-[73px] z-30 bg-background/95 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-none">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-4 py-1.5 text-sm font-medium rounded-sm transition-colors ${
                  filter === f
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground/50 hover:text-foreground hover:bg-muted'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            key={filter}
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                variants={fadeUp}
                className={`group relative rounded-sm overflow-hidden ${i === 0 ? 'md:col-span-2' : ''}`}
              >
                <div
                  className={`${item.imageUrl ? '' : `bg-gradient-to-br ${item.gradient || 'from-slate-900 to-slate-700'}`} ${i === 0 ? 'aspect-[16/9]' : 'aspect-[4/3]'} relative overflow-hidden`}
                  style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
                >
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`, backgroundSize: '30px 30px' }} />
                  {/* CMYK strip */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 flex opacity-60">
                    <div className="flex-1 bg-[#00AEEF]" /><div className="flex-1 bg-[#EC008C]" /><div className="flex-1 bg-[#FFF200]" /><div className="flex-1 bg-[#231F20]" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="text-xs font-semibold tracking-widest uppercase text-white/50 mb-1">{item.productType}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                    {item.description && <p className="text-sm text-white/60">{item.description}</p>}
                    {item.finishDetails && <p className="text-xs text-white/40 mt-1">{item.finishDetails}</p>}
                  </div>
                  {/* Hover CTA */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link to="/quote" className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-foreground text-xs font-semibold rounded-sm hover:bg-white/90 transition-colors">
                      Request Similar <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-foreground/40">
              <p className="text-lg font-medium">No items in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-heading font-bold text-foreground mb-3">Like what you see?</h2>
          <p className="text-foreground/55 mb-8">Request a similar print job or tell us what you need.</p>
          <Link to="/quote" className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground text-sm font-bold rounded-sm hover:bg-primary/90 transition-colors">
            Get a Quote <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </>
  );
}
