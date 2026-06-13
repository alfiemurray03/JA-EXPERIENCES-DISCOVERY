import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { demoBusiness } from '@/data/mockData';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function ReviewsPage() {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const reviews = demoBusiness.reviews;
  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <DashboardLayout>
      <Helmet>
        <title>Reviews — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#0F172A]">Reviews</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Manage your customer reviews</p>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 mb-6 flex items-center gap-6">
          <div className="text-center">
            <p className="text-5xl font-bold text-[#0F172A]">{avgRating.toFixed(1)}</p>
            <div className="flex items-center gap-0.5 justify-center mt-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={16} className={i <= Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} reviews</p>
          </div>
          <div className="flex-1 space-y-1.5">
            {[5,4,3,2,1].map(star => {
              const count = reviews.filter(r => r.rating === star).length;
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground">{star}</span>
                  <Star size={10} className="fill-amber-400 text-amber-400" />
                  <div className="flex-1 h-1.5 bg-amber-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-4 text-muted-foreground">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews list */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id} className="border-border">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-[#0F172A] text-sm">{review.customerName}</p>
                    <p className="text-xs text-muted-foreground">{review.date}</p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} size={14} className={i <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-[#0F172A] leading-relaxed mb-3">{review.comment}</p>
                {review.reply && (
                  <div className="bg-slate-50 border border-border rounded-lg p-3 mb-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Your reply</p>
                    <p className="text-sm text-[#0F172A]">{review.reply}</p>
                  </div>
                )}
                {replyingTo === review.id ? (
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Write your reply..."
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      className="text-sm min-h-[80px]"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-primary text-white text-xs" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                        Post Reply
                      </Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-7" onClick={() => setReplyingTo(review.id)}>
                    <MessageSquare size={13} className="mr-1.5" />
                    Reply
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
