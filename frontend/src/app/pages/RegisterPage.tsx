import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, BookOpen, Loader2, CheckCircle, User, Star, Shield, GraduationCap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { publicApi, authApi } from '../api';

type Role = 'student' | 'advisor' | 'admin';

const roleCards = [
  { role: 'student' as Role, icon: <User size={24} />, title: 'Student seeking guidance', desc: 'I want to ask questions and get guidance about institutions.' },
  { role: 'advisor' as Role, icon: <Star size={24} />, title: 'Peer advisor', desc: 'I have attended an institution and want to help others.' },
  { role: 'admin' as Role, icon: <Shield size={24} />, title: 'Admin', desc: 'Platform administrator.' },
];

function StrengthBar({ password }: { password: string }) {
  const strength = password.length >= 12 ? 3 : password.length >= 8 ? 2 : password.length >= 4 ? 1 : 0;
  const colors = ['#DEDEDE', '#D85A30', '#F59E0B', '#0F6E56'];
  const labels = ['', 'Weak', 'Fair', 'Strong'];
  return (
    <div className="flex items-center gap-2 mt-1.5">
      <div className="flex gap-1 flex-1">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-1 flex-1 rounded-full transition-colors" style={{ backgroundColor: i <= strength ? colors[strength] : '#DEDEDE' }} />
        ))}
      </div>
      {password && <span className="text-[11px]" style={{ color: colors[strength] }}>{labels[strength]}</span>}
    </div>
  );
}

export default function RegisterPage() {
  const { registerAndLogin } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<Role | null>(null);

  // Step 2 fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Step 3 - student
  const [educationLevel, setEducationLevel] = useState('');
  const [country, setCountry] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Step 3 - advisor
  const [institution, setInstitution] = useState('');
  const [programme, setProgramme] = useState('');
  const [yearEntry, setYearEntry] = useState('');
  const [gradYear, setGradYear] = useState('');
  const [advisorTags, setAdvisorTags] = useState<string[]>([]);
  const [uploadName, setUploadName] = useState('');
  const [uploading, setUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [institutions, setInstitutions] = useState<{ id: string; name: string; country: string }[]>([]);
  const [allTags, setAllTags] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    publicApi.getInstitutions().then(r => setInstitutions(r.data.data.institutions ?? [])).catch(() => {});
    publicApi.getTags().then(r => setAllTags(r.data.data.tags ?? [])).catch(() => {});
  }, []);

  const step2Valid = name && email && password.length >= 8 && password === confirmPassword && agreed;
  const step3StudentValid = educationLevel && country;
  const step3AdvisorValid = institution && programme;

  const addInterest = (tag: string) => {
    if (tag && !interests.includes(tag)) setInterests(p => [...p, tag]);
    setTagInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1000));
    setUploadName(file.name);
    setUploading(false);
  };

  const handleComplete = async () => {
    if (!role) return;
    setSubmitting(true);
    setError('');

    try {
      await registerAndLogin({
        fullName: name,
        email,
        password,
        role: role.toUpperCase() as 'STUDENT' | 'ADVISOR' | 'ADMIN',
      });
      setEmailVerificationSent(true);
    } catch (error: any) {
      const message = error?.response?.data?.error?.message ?? error?.message ?? 'Registration failed. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (emailVerificationSent) {
    const handleResend = async () => {
      setResending(true);
      setResendMessage('');
      try {
        await authApi.resendVerification(email);
        setResendMessage('A new verification link has been sent.');
      } catch {
        setResendMessage('Failed to resend. Please try again.');
      } finally {
        setResending(false);
      }
    };

    return (
      <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F7F7FA' }}>
        <div className="w-full max-w-[480px] bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#DEDEDE' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E1F5EE' }}>
            <CheckCircle size={28} style={{ color: '#0F6E56' }} />
          </div>
          <h2 className="mb-2" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Check your email</h2>
          <p className="text-[13px] mb-6" style={{ color: '#5F5E5A' }}>
            We sent a verification link to <strong>{email}</strong>.
          </p>
          {resendMessage && (
            <p className="text-[12px] mb-3" style={{ color: resendMessage.startsWith('Failed') ? '#DC2626' : '#0F6E56' }}>
              {resendMessage}
            </p>
          )}
          <button
            onClick={handleResend}
            disabled={resending}
            className="px-6 py-2.5 rounded-lg border text-[13px] font-medium flex items-center gap-2 mx-auto disabled:opacity-50"
            style={{ borderColor: '#2C2C6E', color: '#2C2C6E' }}
          >
            {resending && <Loader2 size={14} className="animate-spin" />}
            Resend verification email
          </button>
          <div className="mt-3">
            <button onClick={() => navigate('/dashboard')} className="text-[12px] hover:underline" style={{ color: '#888780' }}>
              Continue without verifying
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F7F7FA' }}>
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2C2C6E' }}>
          <BookOpen size={14} className="text-white" />
        </div>
        <span className="font-medium text-[16px]" style={{ color: '#2C2C6E' }}>PeerGuide</span>
      </Link>

      <div className="w-full max-w-[560px] bg-white rounded-xl border p-8" style={{ borderColor: '#DEDEDE' }}>
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i <= step ? 'bg-[#2C2C6E]' : 'bg-[#DEDEDE]'}`} />
          ))}
          <span className="text-[12px] ml-1" style={{ color: '#888780' }}>
            Step {step} of 3 — {step === 1 ? 'Choose your role' : step === 2 ? 'Your details' : 'Your profile'}
          </span>
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div>
            <h2 className="mb-5" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Choose your role</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {roleCards.map(card => (
                <button
                  key={card.role}
                  onClick={() => setRole(card.role)}
                  className={`text-left p-4 rounded-lg border-2 transition-colors ${role === card.role ? 'border-[#2C2C6E] bg-[#EEEDFE]/30' : 'border-[#DEDEDE] hover:border-[#2C2C6E]/30'}`}
                >
                  <div className="mb-2" style={{ color: role === card.role ? '#2C2C6E' : '#5F5E5A' }}>{card.icon}</div>
                  <div className="text-[13px] font-medium mb-1" style={{ color: '#1A1A1A' }}>{card.title}</div>
                  <div className="text-[12px]" style={{ color: '#5F5E5A' }}>{card.desc}</div>
                </button>
              ))}
            </div>
            <button
              disabled={!role}
              onClick={() => setStep(2)}
              className="w-full py-2.5 rounded-lg text-[14px] font-medium text-white disabled:opacity-40"
              style={{ backgroundColor: '#2C2C6E' }}
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div>
            <h2 className="mb-5" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Your details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Full name</label>
                <input value={name} onChange={e => setName(e.target.value)} required placeholder="Your full name" className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 characters" className="w-full px-3 py-2.5 pr-10 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888780' }}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <StrengthBar password={password} />
              </div>
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Confirm password</label>
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: confirmPassword && confirmPassword !== password ? '#D85A30' : '#DEDEDE' }} />
                {confirmPassword && confirmPassword !== password && <p className="text-[12px] mt-1" style={{ color: '#D85A30' }}>Passwords do not match</p>}
              </div>
              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} className="mt-0.5" />
                <span className="text-[13px]" style={{ color: '#5F5E5A' }}>
                  I agree to the <Link to="/" className="underline" style={{ color: '#2C2C6E' }}>Terms of Service</Link> and <Link to="/" className="underline" style={{ color: '#2C2C6E' }}>Privacy Policy</Link>
                </span>
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-lg border text-[13px] font-medium" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>Back</button>
              <button disabled={!step2Valid} onClick={() => setStep(3)} className="flex-1 py-2.5 rounded-lg text-[14px] font-medium text-white disabled:opacity-40" style={{ backgroundColor: '#2C2C6E' }}>Continue</button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div>
            <h2 className="mb-5" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Your profile</h2>

            {role === 'student' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Education level</label>
                  <select value={educationLevel} onChange={e => setEducationLevel(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE', color: educationLevel ? '#1A1A1A' : '#888780' }}>
                    <option value="">Select…</option>
                    {['High school graduate', 'Undergraduate', 'Postgraduate', 'Working professional'].map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Country</label>
                  <input value={country} onChange={e => setCountry(e.target.value)} placeholder="Your country" className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Interests / topics</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {interests.map(t => <TagPill key={t} label={t} removable onRemove={() => setInterests(p => p.filter(x => x !== t))} />)}
                  </div>
                  <div className="flex gap-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest(tagInput))} placeholder="Type and press Enter…" className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {allTags.slice(0, 6).filter(t => !interests.includes(t.name)).map(t => (
                      <button key={t.id} type="button" onClick={() => addInterest(t.name)} className="text-[11px] px-2 py-0.5 rounded-full border hover:bg-[#EEEDFE] transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>+ {t.name}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {role === 'advisor' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Institution attended</label>
                  <select value={institution} onChange={e => setInstitution(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE', color: institution ? '#1A1A1A' : '#888780' }}>
                    <option value="">Select institution…</option>
                    {institutions.map(i => <option key={i.id} value={i.name}>{i.name}, {i.country}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Programme studied</label>
                  <input value={programme} onChange={e => setProgramme(e.target.value)} placeholder="e.g. BSc Computer Science" className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Year of entry</label>
                    <select value={yearEntry} onChange={e => setYearEntry(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none" style={{ borderColor: '#DEDEDE', color: yearEntry ? '#1A1A1A' : '#888780' }}>
                      <option value="">Year…</option>
                      {Array.from({ length: 20 }, (_, i) => 2005 + i).reverse().map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Graduation status</label>
                    <select value={gradYear} onChange={e => setGradYear(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none" style={{ borderColor: '#DEDEDE', color: gradYear ? '#1A1A1A' : '#888780' }}>
                      <option value="">Status…</option>
                      <option>Graduated 2023</option><option>Graduated 2022</option><option>Graduated 2021</option>
                      <option>Currently enrolled</option><option>Left without completing</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Advisory tags</label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {advisorTags.map(t => <TagPill key={t} label={t} removable onRemove={() => setAdvisorTags(p => p.filter(x => x !== t))} />)}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {['Campus life', 'Admission', 'Scholarships', 'Workload', 'Research', 'Career'].filter(t => !advisorTags.includes(t)).map(t => (
                      <button key={t} type="button" onClick={() => setAdvisorTags(p => [...p, t])} className="text-[11px] px-2 py-0.5 rounded-full border hover:bg-[#EEEDFE] transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>+ {t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>ID verification</label>
                  <label className="flex items-center gap-2 px-3 py-2.5 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                    <GraduationCap size={15} style={{ color: '#5F5E5A' }} />
                    <span className="text-[13px]" style={{ color: '#5F5E5A' }}>
                      {uploadName ? uploadName : uploading ? 'Uploading…' : 'Upload student ID, transcript or degree certificate'}
                    </span>
                    <input type="file" accept=".jpg,.png,.pdf" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {uploadName && <p className="text-[12px] mt-1" style={{ color: '#0F6E56' }}>✓ {uploadName} uploaded</p>}
                </div>
                <div className="rounded-lg p-3 text-[12px]" style={{ backgroundColor: '#EEEDFE', color: '#5F5E5A' }}>
                  Your ID will be reviewed within 24 hours. You can still post responses while pending — they will be marked as unverified.
                </div>
              </div>
            )}

            {role === 'admin' && (
              <div className="rounded-lg p-4 text-center text-[13px]" style={{ backgroundColor: '#EEEDFE', color: '#5F5E5A' }}>
                Admin account setup requires an invite link. Contact the platform team.
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 py-2.5 rounded-lg border text-[13px] font-medium" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>Back</button>
              <button
                disabled={submitting || (role === 'student' ? !step3StudentValid : role === 'advisor' ? !step3AdvisorValid : false)}
                onClick={handleComplete}
                className="flex-1 py-2.5 rounded-lg text-[14px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-40"
                style={{ backgroundColor: '#2C2C6E' }}
              >
                {submitting && <Loader2 size={15} className="animate-spin" />}
                Complete registration
              </button>
            </div>
            {error && <p className="mt-3 text-center text-[13px]" style={{ color: '#D85A30' }}>{error}</p>}
          </div>
        )}

        <p className="mt-5 text-center text-[13px]" style={{ color: '#5F5E5A' }}>
          Already have an account?{' '}
          <Link to="/login" className="hover:underline font-medium" style={{ color: '#2C2C6E' }}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

