import { Helmet } from '@dr.pogodin/react-helmet';
import { Upload, Image as ImageIcon, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

import DashboardLayout from '@/layouts/DashboardLayout';

const placeholderImages = [
  { id: '1', label: 'Cover Photo', isCover: true },
  { id: '2', label: 'Interior', isCover: false },
  { id: '3', label: 'Work Sample', isCover: false },
  { id: '4', label: 'Team Photo', isCover: false },
  { id: '5', label: 'Before & After', isCover: false },
  { id: '6', label: 'Equipment', isCover: false },
];

const galleryColors = [
  'from-indigo-400 to-violet-500',
  'from-emerald-400 to-teal-500',
  'from-pink-400 to-rose-500',
  'from-amber-400 to-orange-500',
  'from-blue-400 to-cyan-500',
  'from-purple-400 to-indigo-500',
];

export default function GalleryPage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Gallery — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A]">Gallery</h1>
            <p className="text-muted-foreground text-sm mt-0.5">Manage photos on your public booking page</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-medium">
            <Upload size={16} className="mr-2" />
            Upload Photos
          </Button>
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <ImageIcon size={18} className="text-indigo-600 shrink-0" />
          <p className="text-sm text-indigo-800">
            Add photos to showcase your work. Customers can see your gallery on your public booking page.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {placeholderImages.map((img, i) => (
            <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden border border-border">
              <div className={`w-full h-full bg-gradient-to-br ${galleryColors[i]} flex items-center justify-center`}>
                <ImageIcon size={32} className="text-white/60" />
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors" aria-label="Set as cover">
                  <Star size={16} className="text-amber-500" />
                </button>
                <button className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors" aria-label="Delete photo">
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>
              {img.isCover && (
                <div className="absolute top-2 left-2 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-full">
                  Cover
                </div>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-xs text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  {img.label}
                </span>
              </div>
            </div>
          ))}

          {/* Upload placeholder */}
          <button className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary">
            <Upload size={24} />
            <span className="text-xs font-medium">Upload Photo</span>
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
