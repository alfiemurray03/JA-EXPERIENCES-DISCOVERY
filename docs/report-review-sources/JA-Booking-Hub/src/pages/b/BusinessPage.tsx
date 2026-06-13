import { Helmet } from '@dr.pogodin/react-helmet';
import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion } from 'motion/react';
import {
  Star, MapPin, Phone, Mail, Clock,
  ChevronRight, Image as ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMockBusinessBySlug } from '@/data/mockData';

const galleryColors = [
  'from-indigo-400 to-violet-500',
  'from-emerald-400 to-teal-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
];

const tabs = ['Services', 'About', 'Team', 'Reviews', 'Gallery', 'Contact'];

export default function BusinessPage() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const business = getMockBusinessBySlug(businessSlug || '');
  const [activeTab, setActiveTab] = useState('Services');

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Business not found</h1>
          <p className="text-muted-foreground mb-4">This booking page doesn't exist or has been removed.</p>
          <Link to="/">
            <Button className="bg-primary text-white">Back to JABooking</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{business.name} — Book Online | JABooking</title>
        <meta name="description" content={`Book an appointment with ${business.name} in ${business.city}. ${business.description.slice(0, 120)}`} />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Minimal header */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <img src="/airo-assets/images/logo/horizontal" alt="JABooking" className="h-7 w-auto object-contain" />
          </Link>
          <Link to="/register">
            <Button size="sm" variant="outline" className="text-xs">List your business</Button>
          </Link>
        </div>

        {/* Cover photo */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-500 via-violet-600 to-purple-700 relative">
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Business header */}
        <div className="bg-white border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="relative pb-5">
              {/* Logo */}
              <div className="absolute -top-10 left-0">
                <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-2xl font-bold text-primary">
                  {business.name.charAt(0)}
                </div>
              </div>

              <div className="pt-14">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h1 className="text-2xl font-bold text-[#0F172A]">{business.name}</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">{business.type}</Badge>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={13} className={i <= Math.round(business.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
                        ))}
                        <span className="text-sm font-semibold text-[#0F172A] ml-1">{business.rating}</span>
                        <span className="text-xs text-muted-foreground">({business.reviewCount} reviews)</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin size={12} />
                        {business.city}
                      </span>
                    </div>
                  </div>
                  <Link to={`/book/${business.slug}`}>
                    <Button className="bg-primary hover:bg-primary/90 text-white font-semibold px-6">
                      Book Now
                      <ChevronRight size={16} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-0 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 max-w-4xl py-8">
          {/* Services */}
          {activeTab === 'Services' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Services</h2>
              {business.services.filter(s => s.active).map((svc) => (
                <div key={svc.id} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[#0F172A]">{svc.name}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">{svc.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock size={12} />
                        {svc.duration} min
                      </span>
                      {svc.depositRequired && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                          £{svc.depositAmount} deposit
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-lg font-bold text-[#0F172A]">£{svc.price}</span>
                    <Link to={`/book/${business.slug}?service=${svc.id}`}>
                      <Button size="sm" className="bg-primary text-white text-xs h-8">Book</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {/* About */}
          {activeTab === 'About' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">About {business.name}</h2>
              <div className="bg-white rounded-2xl border border-border p-6">
                <p className="text-[#0F172A] leading-relaxed">{business.description}</p>
              </div>
            </motion.div>
          )}

          {/* Team */}
          {activeTab === 'Team' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Our Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {business.staff.map((member, i) => (
                  <div key={member.id} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0 ${['bg-indigo-600','bg-emerald-600','bg-pink-600'][i % 3]}`}>
                      {member.initials}
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#0F172A]">{member.name}</h3>
                      <p className="text-sm text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Reviews */}
          {activeTab === 'Reviews' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center">
                  <p className="text-5xl font-bold text-[#0F172A]">{business.rating}</p>
                  <div className="flex items-center gap-0.5 justify-center mt-1">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{business.reviewCount} reviews</p>
                </div>
              </div>
              <div className="space-y-4">
                {business.reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold text-[#0F172A] text-sm">{review.customerName}</p>
                      <div className="flex items-center gap-0.5">
                        {[1,2,3,4,5].map(i => (
                          <Star key={i} size={12} className={i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#0F172A] leading-relaxed">{review.comment}</p>
                    <p className="text-xs text-muted-foreground mt-2">{review.date}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Gallery */}
          {activeTab === 'Gallery' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Gallery</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {galleryColors.map((color, i) => (
                  <div key={i} className={`aspect-square rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center`}>
                    <ImageIcon size={28} className="text-white/60" />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Contact */}
          {activeTab === 'Contact' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-bold text-[#0F172A] mb-4">Contact & Location</h2>
              <div className="bg-white rounded-2xl border border-border p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <a href={`tel:${business.phone}`} className="text-sm font-medium text-[#0F172A] hover:text-primary">{business.phone}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <a href={`mailto:${business.email}`} className="text-sm font-medium text-[#0F172A] hover:text-primary">{business.email}</a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-slate-600" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="text-sm font-medium text-[#0F172A]">{business.address}, {business.city}, {business.postcode}</p>
                  </div>
                </div>
                {business.socialLinks.length > 0 && (
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3">Social Media</p>
                    <div className="flex gap-2">
                      {business.socialLinks.map((link) => (
                        <a
                          key={link.platform}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-full border border-border text-xs font-medium text-[#0F172A] hover:border-primary hover:text-primary transition-colors"
                        >
                          {link.platform}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Sticky Book Now (mobile) */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-border p-4 md:hidden z-40">
          <Link to={`/book/${business.slug}`}>
            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold h-12">
              Book Now
            </Button>
          </Link>
        </div>
        <div className="h-20 md:hidden" />
      </div>
    </>
  );
}
