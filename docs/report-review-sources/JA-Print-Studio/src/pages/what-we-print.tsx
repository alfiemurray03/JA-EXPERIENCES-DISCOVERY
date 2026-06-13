import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Upload } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' as const } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

const products = [
  {
    name: 'Business Cards',
    description: 'Standard, square, folded, or die-cut. Gloss, matte, soft-touch, or spot UV laminate. Single or double-sided.',
    sizes: ['85×55mm (Standard)', '55×55mm (Square)', 'Custom sizes'],
    finishes: ['Gloss Laminate', 'Matte Laminate', 'Soft-Touch', 'Spot UV', 'Uncoated'],
    minQty: '25',
    popular: true,
  },
  {
    name: 'Flyers & Leaflets',
    description: 'Full-colour single or double-sided flyers. Ideal for promotions, events, and marketing campaigns.',
    sizes: ['A6', 'A5', 'A4', 'DL', 'Custom'],
    finishes: ['Gloss', 'Matte', 'Silk', 'Uncoated'],
    minQty: '50',
    popular: true,
  },
  {
    name: 'Posters',
    description: 'High-impact posters for indoor and outdoor use. Available in a wide range of sizes and paper weights.',
    sizes: ['A4', 'A3', 'A2', 'A1', 'A0', 'Custom'],
    finishes: ['Gloss', 'Matte', 'Satin'],
    minQty: '1',
    popular: false,
  },
  {
    name: 'Banners',
    description: 'Roll-up, pull-up, and outdoor PVC banners. Perfect for exhibitions, events, and retail.',
    sizes: ['800×2000mm', '850×2000mm', '1000×2000mm', 'Custom'],
    finishes: ['Matte PVC', 'Gloss PVC'],
    minQty: '1',
    popular: false,
  },
  {
    name: 'Stickers & Labels',
    description: 'Custom-shaped stickers and labels on gloss, matte, or clear vinyl. Kiss-cut or die-cut.',
    sizes: ['Custom shapes & sizes'],
    finishes: ['Gloss Vinyl', 'Matte Vinyl', 'Clear Vinyl'],
    minQty: '25',
    popular: true,
  },
  {
    name: 'Menus',
    description: 'Restaurant and café menus. Laminated, folded, or bound. Durable and easy to wipe clean.',
    sizes: ['A5', 'A4', 'A3 Folded', 'Custom'],
    finishes: ['Gloss Laminate', 'Matte Laminate', 'Soft-Touch'],
    minQty: '10',
    popular: false,
  },
  {
    name: 'Booklets & Brochures',
    description: 'Saddle-stitched or perfect-bound booklets. Ideal for catalogues, programmes, and company profiles.',
    sizes: ['A5', 'A4', 'DL', 'Custom'],
    finishes: ['Gloss', 'Matte', 'Silk'],
    minQty: '10',
    popular: false,
  },
  {
    name: 'Letterheads',
    description: 'Branded letterheads on premium paper stock. Single or double-sided.',
    sizes: ['A4'],
    finishes: ['Uncoated 100gsm', 'Uncoated 120gsm'],
    minQty: '50',
    popular: false,
  },
  {
    name: 'Compliment Slips',
    description: 'Branded compliment slips to accompany correspondence and packages.',
    sizes: ['DL (99×210mm)', 'A5', 'Custom'],
    finishes: ['Uncoated', 'Gloss', 'Matte'],
    minQty: '50',
    popular: false,
  },
  {
    name: 'Envelopes',
    description: 'Printed envelopes with your branding. Available in a range of sizes.',
    sizes: ['DL', 'C5', 'C4'],
    finishes: ['Uncoated'],
    minQty: '50',
    popular: false,
  },
  {
    name: 'Notepads',
    description: 'Branded notepads with glued or perforated pages. Custom covers available.',
    sizes: ['A6', 'A5', 'A4'],
    finishes: ['Gloss Cover', 'Matte Cover'],
    minQty: '25',
    popular: false,
  },
  {
    name: 'Document Printing',
    description: 'Black & white or colour document printing. Ideal for reports, proposals, and presentations.',
    sizes: ['A4', 'A3'],
    finishes: ['Uncoated', 'Gloss', 'Matte'],
    minQty: '1',
    popular: false,
  },
  {
    name: 'Custom Print',
    description: "Don't see what you need? We handle bespoke print requests. Tell us what you need and we'll make it happen.",
    sizes: ['Any size'],
    finishes: ['Any finish'],
    minQty: 'Any',
    popular: false,
  },
];

export default function WhatWePrintPage() {
  return (
    <>
      <title>What We Print — JA Print Studio</title>
      <meta name="description" content="13 premium print products — business cards, flyers, posters, banners, stickers, menus, and more. Custom quotes, no fixed pricing." />

      {/* Hero */}
      <section className="py-20 bg-foreground">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-primary" />
              <span className="text-xs font-semibold tracking-widest uppercase text-primary">13 Products</span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-6xl lg:text-7xl font-heading font-bold text-background leading-none mb-4">
              What We Print
            </motion.h1>
            <motion.p variants={fadeUp} className="text-background/50 text-lg max-w-xl">
              Every product is custom-quoted. No automated pricing — our team reviews every job and gives you a fair, accurate price.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {products.map((product) => (
              <motion.div
                key={product.name}
                variants={fadeUp}
                className="group border border-border/60 rounded-sm p-7 hover:border-primary/40 hover:bg-muted/20 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h2 className="text-xl font-heading font-bold text-foreground">{product.name}</h2>
                  {product.popular && (
                    <span className="text-xs font-semibold px-2 py-0.5 bg-primary text-primary-foreground rounded-sm">Popular</span>
                  )}
                </div>
                <p className="text-sm text-foreground/55 leading-relaxed mb-5">{product.description}</p>

                <div className="space-y-3 mb-6">
                  <div>
                    <div className="text-xs font-semibold tracking-widest uppercase text-foreground/30 mb-1.5">Sizes</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.sizes.map((s) => (
                        <span key={s} className="text-xs px-2 py-1 bg-muted text-foreground/60 rounded-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold tracking-widest uppercase text-foreground/30 mb-1.5">Finishes</div>
                    <div className="flex flex-wrap gap-1.5">
                      {product.finishes.map((f) => (
                        <span key={f} className="text-xs px-2 py-1 bg-muted text-foreground/60 rounded-sm">{f}</span>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-foreground/40">Min. qty: <span className="text-foreground/60 font-medium">{product.minQty}</span></div>
                </div>

                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors group/link"
                >
                  Get a Quote
                  <ArrowRight size={14} className="group-hover/link:translate-x-0.5 transition-transform" />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-muted/30 border-t border-border/30">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-heading font-bold text-foreground mb-2">Ready to get started?</h2>
              <p className="text-foreground/55">Upload your artwork and request a custom quote from our team.</p>
            </div>
            <div className="flex gap-3">
              <Link to="/quote" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-semibold rounded-sm hover:bg-primary/90 transition-colors">
                Get a Quote <ArrowRight size={14} />
              </Link>
              <Link to="/quote" className="inline-flex items-center gap-2 px-6 py-3 border border-border/60 text-foreground text-sm font-semibold rounded-sm hover:bg-muted transition-colors">
                <Upload size={14} /> Upload Artwork
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
