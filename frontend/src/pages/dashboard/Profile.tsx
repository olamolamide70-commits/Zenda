import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Loader2, 
  Building2, 
  UploadCloud, 
  Camera, 
  ArrowLeft, 
  CheckCircle,
  FileText
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { authService, merchantService } from '@/services';
import api from '@/services/api';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Profile() {
  const { user, login } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Immersive B2B Onboarding Wizard States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);
  const [businessName, setBusinessName] = useState('');
  const [tin, setTin] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [cacDocUrl, setCacDocUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCac, setUploadingCac] = useState(false);
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.avatar_url || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('image', file);
      // DO NOT set Content-Type manually — browser must auto-set it with the multipart boundary
      const res = await api.post('/upload/image', formData);
      const newUrl = res.data.url;
      setAvatarUrl(newUrl);
      // Persist avatar_url to profile
      const updatedUser = await authService.updateProfile({ avatar_url: newUrl });
      const token = localStorage.getItem('auth_token') || '';
      login(updatedUser, token);
      toast.success('Profile picture updated! 📸');
    } catch (err: any) {
      console.error('Avatar upload error:', err?.response?.data || err.message);
      toast.error(err?.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const name = `${firstName} ${lastName}`.trim();
    const nin = formData.get('nin') as string;
    const bvn = formData.get('bvn') as string;

    if (nin && nin.length !== 11) {
      toast.warning('NIN must be exactly 11 digits');
      return;
    }
    if (bvn && bvn.length !== 11) {
      toast.warning('BVN must be exactly 11 digits');
      return;
    }

    try {
      setIsUpdating(true);
      const updatedUser = await authService.updateProfile({ name, nin, bvn });
      const token = localStorage.getItem('auth_token') || '';
      login(updatedUser, token);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };

  // 1. Upload Business Logo File
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('image', file);
      // DO NOT set Content-Type manually — browser must auto-set it with the multipart boundary
      const res = await api.post('/upload/image', formData);
      setLogoUrl(res.data.url);
      toast.success('Logo uploaded successfully!');
    } catch (err: any) {
      console.error('Logo upload error:', err?.response?.data || err.message);
      toast.error(err?.response?.data?.error || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  // 2. Upload CAC Certificate File
  const handleCacUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCac(true);
      const formData = new FormData();
      formData.append('image', file);
      // DO NOT set Content-Type manually — browser must auto-set it with the multipart boundary
      const res = await api.post('/upload/image', formData);
      setCacDocUrl(res.data.url);
      toast.success('CAC filing document uploaded successfully!');
    } catch (err: any) {
      console.error('CAC upload error:', err?.response?.data || err.message);
      toast.error(err?.response?.data?.error || 'Failed to upload CAC document');
    } finally {
      setUploadingCac(false);
    }
  };

  // 3. Submit Onboarding Form to register organization
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName || !tin || !cacNumber) {
      return toast.warning('Please fill in all company information fields');
    }

    try {
      setSubmittingOnboarding(true);
      // Register corporate listing
      await api.post('/b2b/organization/register', {
        name: businessName,
        tin: tin,
        cac_number: cacNumber,
        cac_url: cacDocUrl || logoUrl // Fallback in case document is missing
      });

      toast.success('Business successfully onboarded! Upgrading profile...');
      
      // Upgrade to merchant/merchant role
      await merchantService.register();
      
      // Refresh local profile
      const updatedUser = await authService.getProfile();
      const token = localStorage.getItem('auth_token') || '';
      login(updatedUser, token);
      
      setShowOnboarding(false);
      toast.success('Congratulations! You are now a Zenda Merchant Partner!');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to complete merchant onboarding');
    } finally {
      setSubmittingOnboarding(false);
    }
  };

  const nameParts = user?.name?.split(' ') || ['', ''];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-16">
      
      <AnimatePresence mode="wait">
        {!showOnboarding ? (
          // STANDARD ACCOUNT PROFILE VIEW
          <motion.div 
            key="profile-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-10"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">Settings</p>
              <h1 className="text-4xl font-black text-foreground tracking-tight">Account Profile</h1>
              <p className="mt-1 text-muted-foreground font-medium">Manage your personal information and account security.</p>
            </div>

            <div className="max-w-3xl overflow-hidden rounded-[2.5rem] border border-border bg-white shadow-sm hover:shadow-md transition-shadow">
              <div className="h-32 bg-slate-50 border-b border-border" />
              <div className="px-8 pb-10">
                <div className="relative -mt-16 mb-10 flex items-end gap-6">
                  {/* Avatar with upload */}
                  <label className="relative cursor-pointer group/avatar flex-shrink-0" title="Click to change photo">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-primary text-4xl font-black text-white shadow-lg ring-4 ring-white select-none overflow-hidden">
                      {avatarUrl ? (
                        <img src={avatarUrl.startsWith('http') ? avatarUrl : `${import.meta.env.VITE_IMAGE_BASE_URL}${avatarUrl}`} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        user?.name?.[0] || user?.email?.[0]?.toUpperCase()
                      )}
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 rounded-3xl bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                      {uploadingAvatar ? (
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                      ) : (
                        <Camera className="h-6 w-6 text-white" />
                      )}
                    </div>
                    {/* Small camera badge */}
                    <div className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md">
                      <Camera className="h-3.5 w-3.5 text-white" />
                    </div>
                  </label>
                  <div className="pb-2">
                    <h2 className="text-2xl font-black text-foreground tracking-tight">{user?.name || 'Incomplete Profile'}</h2>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                      {user?.role === 'super_admin' ? 'System Administrator' : (user?.role === 'merchant' || user?.role === 'merchant') ? 'Merchant Partner' : 'Verified Member'}
                    </p>
                    <p className="text-[10px] text-muted-foreground/50 font-bold mt-1 uppercase tracking-widest">Click photo to change</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitProfile} className="space-y-8">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">First Name</Label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input name="firstName" defaultValue={firstName} placeholder="Your first name" className="h-14 pl-12 bg-slate-50 border-slate-100 rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold text-sm" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Last Name</Label>
                      <Input name="lastName" defaultValue={lastName} placeholder="Your last name" className="h-14 px-6 bg-slate-50 border-slate-100 rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      <Input type="email" value={user?.email || ''} disabled className="h-14 pl-12 bg-slate-100 border-slate-100 rounded-xl text-slate-400 cursor-not-allowed font-bold text-sm" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="+234..." className="h-14 pl-12 bg-slate-50 border-slate-100 rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold text-sm" />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">National Identification Number (NIN)</Label>
                      <Input 
                        name="nin" 
                        defaultValue={user?.nin || ''} 
                        placeholder="11-digit NIN" 
                        maxLength={11}
                        className="h-14 px-6 bg-slate-50 border-slate-100 rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold text-sm" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Bank Verification Number (BVN)</Label>
                      <Input 
                        name="bvn" 
                        defaultValue={user?.bvn || ''} 
                        placeholder="11-digit BVN" 
                        maxLength={11}
                        className="h-14 px-6 bg-slate-50 border-slate-100 rounded-xl text-foreground focus:ring-primary/20 transition-all font-bold text-sm" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-2">Delivery Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
                      <textarea 
                        placeholder="Set your delivery address..." 
                        className="w-full min-h-[120px] pl-12 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-sm resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row gap-4">
                    <Button disabled={isUpdating} type="submit" className="h-14 flex-1 rounded-xl bg-primary text-sm font-bold text-white transition-all shadow-md">
                      {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShieldCheck className="mr-2 h-5 w-5" />}
                      {isUpdating ? 'Saving Changes...' : 'Save Profile'}
                    </Button>
                  </div>

                  {/* MERCHANT PARTNER UPGRADE TRIGGERS CARD */}
                  {user?.role !== 'merchant' && user?.role !== 'admin' && user?.role !== 'super_admin' && (
                    <div className="mt-12 p-8 rounded-[2rem] border border-indigo-100 bg-indigo-50/20 space-y-4 text-left">
                      <div className="flex gap-4 items-start">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 uppercase text-xs tracking-wider">Merchant Partner Portal</h3>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1.5">
                            Upgrade to a Merchant Partner account to onboard your store, list electronics, unlock Zenda's drop-in installment checkout APIs, and track delivery payouts.
                          </p>
                        </div>
                      </div>
                      <div className="pt-2">
                        <Button 
                          type="button" 
                          onClick={() => {
                            setOnboardingStep(1);
                            setShowOnboarding(true);
                          }}
                          className="h-12 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest flex items-center shadow-lg shadow-indigo-600/10"
                        >
                          <Building2 className="h-4 w-4 mr-2" />
                          Apply to Upgrade
                        </Button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </motion.div>
        ) : (
          // MULTI-STEP B2B ONBOARDING WIZARD
          <motion.div 
            key="onboarding-wizard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="max-w-2xl mx-auto space-y-8"
          >
            {/* Header / Nav */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-6">
              <button 
                onClick={() => {
                  if (onboardingStep === 2) setOnboardingStep(1);
                  else setShowOnboarding(false);
                }}
                className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-xs uppercase tracking-widest"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${onboardingStep === 1 ? 'bg-primary' : 'bg-primary/30'}`} />
                <span className={`h-2.5 w-2.5 rounded-full ${onboardingStep === 2 ? 'bg-primary' : 'bg-primary/30'}`} />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Onboarding Step {onboardingStep} of 2</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase leading-none">
                {onboardingStep === 1 ? 'Company Profile Setup' : 'Verify Certificates'}
              </h2>
              <p className="text-slate-500 font-medium text-xs">
                {onboardingStep === 1 
                  ? 'Tell us about your corporate gadget procurement agency or storefront.'
                  : 'Upload your CAC registration and store graphics to activate your line.'
                }
              </p>
            </div>

            <form onSubmit={handleOnboardingSubmit} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-8">
              
              {/* STEP 1: CORPORATE MAPPING DETAILS */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Business/Brand Name</Label>
                    <Input 
                      placeholder="e.g. Slot Systems Nigeria" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CAC RC Number</Label>
                    <Input 
                      placeholder="e.g. RC-1928492" 
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white text-sm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Corporate TIN (Tax ID)</Label>
                    <Input 
                      placeholder="e.g. 19482019-0001" 
                      value={tin}
                      onChange={(e) => setTin(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 bg-slate-50/50 focus-visible:ring-primary focus-visible:bg-white text-sm"
                    />
                  </div>

                  <Button 
                    type="button"
                    onClick={() => {
                      if (!businessName || !cacNumber || !tin) {
                        return toast.warning('Please fill in all fields before proceeding');
                      }
                      setOnboardingStep(2);
                    }}
                    className="w-full h-14 rounded-xl bg-primary text-white font-black hover:bg-primary/95 text-xs uppercase tracking-widest"
                  >
                    Continue to Uploads
                  </Button>
                </div>
              )}

              {/* STEP 2: DOCUMENTS UPLOADS */}
              {onboardingStep === 2 && (
                <div className="space-y-8">
                  
                  {/* Upload 1: Business Logo */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Snap & Upload Store Logo</Label>
                    <div className="flex items-center gap-6 p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/30">
                      <div className="relative h-20 w-20 rounded-2xl border bg-white flex items-center justify-center overflow-hidden shrink-0 group">
                        {logoUrl ? (
                          <img src={logoUrl} alt="Store Logo" className="h-full w-full object-cover" />
                        ) : (
                          <Camera className="h-6 w-6 text-slate-300" />
                        )}
                        {uploadingLogo && (
                          <div className="absolute inset-0 bg-slate-900/50 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="h-10 px-4 rounded-xl bg-white border shadow-sm flex items-center justify-center text-xs font-black uppercase tracking-wider text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors">
                          Choose File
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                        </label>
                        <p className="text-[9px] text-slate-400 font-semibold">Supports PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Upload 2: CAC Certificate File */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">CAC Registration Certificate</Label>
                    
                    <div className="relative rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/30 group hover:bg-slate-50/50 transition-colors">
                      <input 
                        type="file" 
                        accept="image/*,application/pdf" 
                        onChange={handleCacUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      
                      {uploadingCac ? (
                        <div className="space-y-2">
                          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-primary">Uploading filing certificate...</p>
                        </div>
                      ) : cacDocUrl ? (
                        <div className="space-y-2">
                          <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto" />
                          <p className="text-xs font-black text-slate-800 uppercase tracking-wide">Filing Uploaded Successfully!</p>
                          <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider">Verification Ready</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                            <UploadCloud className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-700 uppercase tracking-wider">Drag or Select Certificate</p>
                            <p className="text-[9px] text-slate-400 font-medium mt-1">Upload your official Corporate Affairs Commission document (PNG or JPG)</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit"
                    disabled={submittingOnboarding || uploadingCac || uploadingLogo}
                    className="w-full h-14 rounded-xl bg-indigo-600 text-white font-black hover:bg-indigo-700 text-xs uppercase tracking-widest flex items-center justify-center shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
                  >
                    {submittingOnboarding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Building2 className="h-4 w-4 mr-2" />}
                    {submittingOnboarding ? 'Registering Corporate Profile...' : 'Submit Onboarding Application'}
                  </Button>
                </div>
              )}

            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

