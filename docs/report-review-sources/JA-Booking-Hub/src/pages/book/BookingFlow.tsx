import { Helmet } from '@dr.pogodin/react-helmet';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Clock, User, Calendar,
  CreditCard, Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getMockBusinessBySlug } from '@/data/mockData';

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '13:00', '13:30', '14:00', '14:30', '15:00',
  '15:30', '16:00', '16:30', '17:00',
];
const unavailableSlots = ['10:00', '11:30', '14:00'];

const stepVariants = {
  enter: { opacity: 0, x: 20 },
  center: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function BookingFlow() {
  const { businessSlug } = useParams<{ businessSlug: string }>();
  const [searchParams] = useSearchParams();
  const business = getMockBusinessBySlug(businessSlug || '');

  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(searchParams.get('service') || '');
  const [selectedStaff, setSelectedStaff] = useState('any');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const selectedSvc = business?.services.find(s => s.id === selectedService);
  const selectedStaffMember = business?.staff.find(s => s.id === selectedStaff);

  const bookingRef = `JBH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[#0F172A] mb-2">Business not found</h1>
          <Link to="/"><Button>Go Home</Button></Link>
        </div>
      </div>
    );
  }

  const canProceed = () => {
    if (step === 1) return !!selectedService;
    if (step === 2) return true;
    if (step === 3) return !!selectedDate && !!selectedTime;
    if (step === 4) return !!firstName && !!lastName && !!email && !!phone;
    return true;
  };

  const stepLabels = ['Service', 'Staff', 'Date & Time', 'Your Details', 'Payment', 'Confirmed'];

  return (
    <>
      <Helmet>
        <title>Book with {business.name} — JABooking</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-border px-4 py-3 flex items-center gap-3">
          {step > 1 && step < 6 ? (
            <button onClick={() => setStep(step - 1)} className="p-1.5 hover:bg-muted rounded-md" aria-label="Back">
              <ArrowLeft size={18} />
            </button>
          ) : (
            <Link to={`/b/${business.slug}`} className="p-1.5 hover:bg-muted rounded-md">
              <ArrowLeft size={18} />
            </Link>
          )}
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#0F172A]">Book with {business.name}</p>
            <p className="text-xs text-muted-foreground">{business.city}</p>
          </div>
          <div className="flex items-center gap-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={11} className="fill-amber-400 text-amber-400" />
            ))}
            <span className="text-xs text-muted-foreground ml-1">{business.rating}</span>
          </div>
        </div>

        {/* Progress */}
        {step < 6 && (
          <div className="bg-white border-b border-border px-4 py-3">
            <div className="flex items-center gap-1 max-w-lg mx-auto">
              {stepLabels.slice(0, 5).map((label, i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    i + 1 < step ? 'bg-emerald-500 text-white' :
                    i + 1 === step ? 'bg-primary text-white' :
                    'bg-slate-200 text-slate-400'
                  }`}>
                    {i + 1 < step ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  {i < 4 && <div className={`flex-1 h-0.5 mx-1 ${i + 1 < step ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="max-w-lg mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            {/* Step 1: Select Service */}
            {step === 1 && (
              <motion.div key="s1" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h2 className="text-xl font-bold text-[#0F172A] mb-5">Select a Service</h2>
                <div className="space-y-3">
                  {business.services.filter(s => s.active).map((svc) => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all bg-white ${
                        selectedService === svc.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedService === svc.id ? 'border-primary' : 'border-slate-300'}`}>
                        {selectedService === svc.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#0F172A]">{svc.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{svc.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock size={11} />{svc.duration} min
                          </span>
                          {svc.depositRequired && (
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">
                              £{svc.depositAmount} deposit
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-[#0F172A] shrink-0">£{svc.price}</span>
                    </button>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-primary text-white font-semibold h-12" disabled={!canProceed()} onClick={() => setStep(2)}>
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Select Staff */}
            {step === 2 && (
              <motion.div key="s2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h2 className="text-xl font-bold text-[#0F172A] mb-5">Select a Team Member</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedStaff('any')}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all bg-white ${selectedStaff === 'any' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#0F172A]">No preference</p>
                      <p className="text-xs text-muted-foreground">Next available team member</p>
                    </div>
                    {selectedStaff === 'any' && <CheckCircle2 size={18} className="text-primary ml-auto" />}
                  </button>
                  {business.staff.map((member, i) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedStaff(member.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all bg-white ${selectedStaff === member.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold shrink-0 ${['bg-indigo-600','bg-emerald-600'][i % 2]}`}>
                        {member.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-[#0F172A]">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.role}</p>
                      </div>
                      {selectedStaff === member.id && <CheckCircle2 size={18} className="text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
                <Button className="w-full mt-6 bg-primary text-white font-semibold h-12" onClick={() => setStep(3)}>
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <motion.div key="s3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h2 className="text-xl font-bold text-[#0F172A] mb-5">Choose Date & Time</h2>
                <div className="bg-white rounded-2xl border border-border p-5 mb-4">
                  <Label className="text-sm font-medium mb-2 block">Select Date</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="h-11"
                  />
                </div>
                {selectedDate && (
                  <div className="bg-white rounded-2xl border border-border p-5">
                    <p className="text-sm font-medium text-[#0F172A] mb-3">Available Times</p>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map((slot) => {
                        const unavailable = unavailableSlots.includes(slot);
                        return (
                          <button
                            key={slot}
                            disabled={unavailable}
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 rounded-lg text-sm font-medium transition-all ${
                              unavailable ? 'bg-slate-100 text-slate-300 cursor-not-allowed' :
                              selectedTime === slot ? 'bg-primary text-white' :
                              'bg-slate-50 text-[#0F172A] hover:bg-primary/10 border border-border'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <Button className="w-full mt-6 bg-primary text-white font-semibold h-12" disabled={!canProceed()} onClick={() => setStep(4)}>
                  Continue <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 4: Your Details */}
            {step === 4 && (
              <motion.div key="s4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h2 className="text-xl font-bold text-[#0F172A] mb-5">Your Details</h2>
                <div className="bg-white rounded-2xl border border-border p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">First name *</Label>
                      <Input value={firstName} onChange={e => setFirstName(e.target.value)} placeholder="First name" className="h-10" />
                    </div>
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Last name *</Label>
                      <Input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Last name" className="h-10" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Email address *</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Phone number *</Label>
                    <Input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="07700 000000" className="h-10" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium mb-1.5 block">Notes (optional)</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any special requests or information..." className="text-sm min-h-[80px]" />
                  </div>
                </div>
                <Button className="w-full mt-6 bg-primary text-white font-semibold h-12" disabled={!canProceed()} onClick={() => setStep(5)}>
                  Continue to Payment <ArrowRight size={16} className="ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 5: Payment */}
            {step === 5 && (
              <motion.div key="s5" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }}>
                <h2 className="text-xl font-bold text-[#0F172A] mb-5">Confirm & Pay</h2>

                {/* Order summary */}
                <div className="bg-white rounded-2xl border border-border p-5 mb-4">
                  <h3 className="text-sm font-semibold text-[#0F172A] mb-4">Booking Summary</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium text-[#0F172A]">{selectedSvc?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Staff</span>
                      <span className="font-medium text-[#0F172A]">
                        {selectedStaff === 'any' ? 'No preference' : selectedStaffMember?.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date</span>
                      <span className="font-medium text-[#0F172A]">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time</span>
                      <span className="font-medium text-[#0F172A]">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration</span>
                      <span className="font-medium text-[#0F172A]">{selectedSvc?.duration} min</span>
                    </div>
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-semibold text-[#0F172A]">
                        {selectedSvc?.depositRequired ? 'Deposit due now' : 'Total'}
                      </span>
                      <span className="font-bold text-[#0F172A] text-lg">
                        £{selectedSvc?.depositRequired ? selectedSvc.depositAmount : selectedSvc?.price}
                      </span>
                    </div>
                    {selectedSvc?.depositRequired && (
                      <p className="text-xs text-muted-foreground">
                        Remaining £{(selectedSvc.price - (selectedSvc.depositAmount || 0))} due at appointment
                      </p>
                    )}
                  </div>
                </div>

                {/* Payment form */}
                <div className="bg-white rounded-2xl border border-border p-5 mb-4">
                  <div className="flex items-center gap-2 mb-4">
                    <CreditCard size={18} className="text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-[#0F172A]">Card Details</h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium mb-1.5 block">Card number</Label>
                      <Input placeholder="1234 5678 9012 3456" className="h-10 font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">Expiry</Label>
                        <Input placeholder="MM/YY" className="h-10 font-mono" />
                      </div>
                      <div>
                        <Label className="text-sm font-medium mb-1.5 block">CVC</Label>
                        <Input placeholder="123" className="h-10 font-mono" />
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-emerald-500" />
                    Payments are processed securely via Stripe
                  </p>
                </div>

                <Button className="w-full bg-primary text-white font-semibold h-12" onClick={() => setStep(6)}>
                  Confirm & Pay £{selectedSvc?.depositRequired ? selectedSvc.depositAmount : selectedSvc?.price}
                </Button>
              </motion.div>
            )}

            {/* Step 6: Confirmation */}
            {step === 6 && (
              <motion.div key="s6" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.2 }} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                >
                  <CheckCircle2 size={40} className="text-emerald-600" />
                </motion.div>
                <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Booking Confirmed!</h2>
                <p className="text-muted-foreground mb-6">
                  Your appointment with {business.name} is confirmed. A confirmation email has been sent to {email}.
                </p>

                <div className="bg-white rounded-2xl border border-border p-5 text-left mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-[#0F172A]">Booking Details</h3>
                    <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">{bookingRef}</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Business</span>
                      <span className="font-medium text-[#0F172A]">{business.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service</span>
                      <span className="font-medium text-[#0F172A]">{selectedSvc?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date & Time</span>
                      <span className="font-medium text-[#0F172A]">{selectedDate} at {selectedTime}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button variant="outline" className="w-full font-medium">
                    <Calendar size={16} className="mr-2" />
                    Add to Google Calendar
                  </Button>
                  <Link to={`/b/${business.slug}`}>
                    <Button variant="ghost" className="w-full text-muted-foreground">
                      Back to {business.name}
                    </Button>
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}
