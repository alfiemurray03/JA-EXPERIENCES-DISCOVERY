import { Helmet } from '@dr.pogodin/react-helmet';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Scissors, Dumbbell, BookOpen, Heart, Home, PawPrint,
  Briefcase, Camera, Users, CheckCircle2, ArrowRight, ArrowLeft, Eye, EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { businessCategories } from '@/data/businessCategories';
import { useState } from 'react';
import { BUSINESS_AUTH } from '@/lib/auth-config';

const iconMap: Record<string, React.ElementType> = {
  Scissors, Dumbbell, BookOpen, Heart, Home, PawPrint, Briefcase, Camera, Users,
};

const MicrosoftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

const plans = [
  { id: 'free', name: 'Free', price: '£0', desc: 'Get started, no card needed', features: ['20 appointments/month', 'Basic booking page', 'Subdomain included'] },
  { id: 'starter', name: 'Starter', price: '£9.99/mo', desc: 'For growing businesses', features: ['100 appointments/month', 'Email reminders', 'Stripe payments'] },
  { id: 'professional', name: 'Professional', price: '£19.99/mo', desc: 'Most popular', features: ['Unlimited appointments', 'Custom domain', 'Remove branding'], highlight: true },
  { id: 'business', name: 'Business', price: '£39.99/mo', desc: 'For scaling operations', features: ['Multiple locations', 'Memberships', 'Loyalty programme'] },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 40);
}

export default function RegisterPage() {
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedType, setSelectedType] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get('plan') || 'free');

  const subdomain = slugify(businessName);
  const selectedCategoryData = businessCategories.find((c) => c.id === selectedCategory);

  const totalSteps = 6;

  const handleMicrosoftSignup = () => {
    const params = new URLSearchParams({
      client_id: BUSINESS_AUTH.clientId,
      response_type: 'code',
      redirect_uri: BUSINESS_AUTH.redirectUri,
      scope: BUSINESS_AUTH.scopes.join(' '),
      response_mode: 'query',
      prompt: 'create',
    });
    window.location.href = `${BUSINESS_AUTH.authorizeUrl}?${params.toString()}`;
  };

  const canProceed = () => {
    if (step === 1) return fullName && email && password && password === confirmPassword;
    if (step === 2) return !!selectedCategory;
    if (step === 3) return !!selectedType;
    if (step === 4) return businessName.length >= 2;
    if (step === 5) return true;
    return true;
  };

  const stepVariants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <>
      <Helmet>
        <title>Create Your Account — JABooking</title>
        <meta name="description" content="Create your free JABooking account and get your professional booking page live in minutes." />
        <meta name="robots" content="noindex" />
      </Helmet>

      <main className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-slate-50 to-indigo-50/30 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-4">
              <img src="/airo-assets/images/logo/horizontal" alt="JABooking" className="h-10 w-auto object-contain mx-auto" />
            </Link>
          </div>

          {/* Progress bar */}
          {step < 6 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Step {step} of {totalSteps - 1}</span>
                <span className="text-xs text-muted-foreground">{Math.round((step / (totalSteps - 1)) * 100)}% complete</span>
              </div>
              <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
            <AnimatePresence mode="wait">
              {/* ── STEP 1: Create Account ─────────────────────────────── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.25 }}
                  className="p-8"
                >
                  <h2 className="text-xl font-bold text-[#0F172A] mb-1">Create your account</h2>
                  <p className="text-sm text-muted-foreground mb-6">Free forever. No credit card required.</p>

                  <Button type="button" variant="outline" className="w-full h-11 font-medium border-2 mb-5" onClick={handleMicrosoftSignup}>
                    <MicrosoftIcon />
                    <span className="ml-2">Sign up with Microsoft</span>
                  </Button>

                  <div className="relative mb-5">
                    <Separator />
                    <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-xs text-muted-foreground">or</span>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="fullName" className="text-sm font-medium mb-1.5 block">Full name</Label>
                      <Input id="fullName" placeholder="Your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11" />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium mb-1.5 block">Email address</Label>
                      <Input id="email" type="email" placeholder="you@yourbusiness.co.uk" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
                    </div>
                    <div>
                      <Label htmlFor="password" className="text-sm font-medium mb-1.5 block">Password</Label>
                      <div className="relative">
                        <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 pr-10" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword" className="text-sm font-medium mb-1.5 block">Confirm password</Label>
                      <Input id="confirmPassword" type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11" />
                      {confirmPassword && password !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      By creating an account, you agree to our{' '}
                      <Link to="/terms" className="text-primary hover:underline">Terms</Link> and{' '}
                      <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                    <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={!canProceed()} onClick={() => setStep(2)}>
                      Continue
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>

                  <p className="text-center text-sm text-muted-foreground mt-5">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: Choose Category ────────────────────────────── */}
              {step === 2 && (
                <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-8">
                  <h2 className="text-xl font-bold text-[#0F172A] mb-1">Choose your business category</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select the category that best describes your business.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {businessCategories.map((cat) => {
                      const Icon = iconMap[cat.icon] || Briefcase;
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 hover:bg-slate-50'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: cat.color + '18', color: cat.color }}>
                            <Icon size={18} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold truncate ${isSelected ? 'text-primary' : 'text-[#0F172A]'}`}>{cat.name}</p>
                            <p className="text-xs text-muted-foreground">{cat.types.length} types</p>
                          </div>
                          {isSelected && <CheckCircle2 size={16} className="text-primary ml-auto shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={!canProceed()} onClick={() => setStep(3)}>
                      Continue <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Choose Business Type ───────────────────────── */}
              {step === 3 && (
                <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-8">
                  <h2 className="text-xl font-bold text-[#0F172A] mb-1">What type of business are you?</h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Select your specific business type within <span className="font-medium text-[#0F172A]">{selectedCategoryData?.name}</span>.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-6 max-h-72 overflow-y-auto pr-1">
                    {selectedCategoryData?.types.map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type)}
                        className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-all ${
                          selectedType === type
                            ? 'border-primary bg-primary text-white'
                            : 'border-border text-[#0F172A] hover:border-primary/40 hover:bg-slate-50'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={!canProceed()} onClick={() => setStep(4)}>
                      Continue <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 4: Business Details ───────────────────────────── */}
              {step === 4 && (
                <motion.div key="step4" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-8">
                  <h2 className="text-xl font-bold text-[#0F172A] mb-1">Tell us about your business</h2>
                  <p className="text-sm text-muted-foreground mb-6">This information will appear on your public booking page.</p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="businessName" className="text-sm font-medium mb-1.5 block">Business name *</Label>
                      <Input id="businessName" placeholder="e.g. Marcus Cuts" value={businessName} onChange={(e) => setBusinessName(e.target.value)} className="h-11" />
                    </div>

                    {businessName.length >= 2 && (
                      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-indigo-700 mb-1">Your booking page URL:</p>
                        <p className="text-sm font-mono text-indigo-900 break-all">
                          https://<span className="font-bold">{subdomain}</span>.jabooking.jagroupservices.co.uk
                        </p>
                      </motion.div>
                    )}

                    <div>
                      <Label htmlFor="phone" className="text-sm font-medium mb-1.5 block">Phone number</Label>
                      <Input id="phone" type="tel" placeholder="07700 000000" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-11" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city" className="text-sm font-medium mb-1.5 block">Town / City</Label>
                        <Input id="city" placeholder="Birmingham" value={city} onChange={(e) => setCity(e.target.value)} className="h-11" />
                      </div>
                      <div>
                        <Label htmlFor="postcode" className="text-sm font-medium mb-1.5 block">Postcode</Label>
                        <Input id="postcode" placeholder="B1 1AA" value={postcode} onChange={(e) => setPostcode(e.target.value)} className="h-11" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(3)}>
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" disabled={!canProceed()} onClick={() => setStep(5)}>
                      Continue <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 5: Choose Plan ────────────────────────────────── */}
              {step === 5 && (
                <motion.div key="step5" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-8">
                  <h2 className="text-xl font-bold text-[#0F172A] mb-1">Choose your plan</h2>
                  <p className="text-sm text-muted-foreground mb-6">Start free and upgrade anytime. No credit card required for the Free plan.</p>

                  <div className="space-y-3 mb-6">
                    {plans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPlan === plan.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/30'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedPlan === plan.id ? 'border-primary' : 'border-slate-300'}`}>
                          {selectedPlan === plan.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-[#0F172A]">{plan.name}</span>
                            {plan.highlight && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Popular</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{plan.features.join(' · ')}</p>
                        </div>
                        <span className="text-sm font-bold text-[#0F172A] shrink-0">{plan.price}</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setStep(4)}>
                      <ArrowLeft size={16} className="mr-2" /> Back
                    </Button>
                    <Button className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold" onClick={() => setStep(6)}>
                      Create Account <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 6: Success ────────────────────────────────────── */}
              {step === 6 && (
                <motion.div key="step6" variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.25 }} className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6"
                  >
                    <CheckCircle2 size={40} className="text-emerald-600" />
                  </motion.div>
                  <h2 className="text-2xl font-bold text-[#0F172A] mb-2">You're all set!</h2>
                  <p className="text-muted-foreground mb-4">
                    Welcome to JABooking, <span className="font-medium text-[#0F172A]">{fullName || 'there'}</span>!
                  </p>
                  {businessName && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 mb-6 text-left">
                      <p className="text-xs font-semibold text-indigo-700 mb-1">Your booking page:</p>
                      <p className="text-sm font-mono text-indigo-900 break-all">
                        https://{subdomain}.jabooking.jagroupservices.co.uk
                      </p>
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground mb-8">
                    Your booking page is being set up. Head to your dashboard to complete your profile, add services and start taking bookings.
                  </p>
                  <Link to="/dashboard">
                    <Button size="lg" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                      Go to Dashboard
                      <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </>
  );
}
