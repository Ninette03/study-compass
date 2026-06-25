import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { Edit2, CheckCircle, Upload, Save, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { TagPill } from '../components/shared/TagPill (1)';
import { SentimentBadge } from '../components/shared/SentimentBadge';
import { VerifiedBadge } from '../components/shared/VerifiedBadge';
import { profileApi, questionApi } from '../api';
import { toast } from 'sonner';

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'advisor';
  institution?: string;
  programme?: string;
  yearEntry?: number;
  yearGrad?: number;
  isVerified?: boolean;
  credibilityScore?: number;
  totalUpvotes?: number;
  tags?: string[];
  interests?: string[];
  joinDate?: string;
}

interface Question {
  id: string;
  title: string;
  institution?: { name: string };
  tags: { name: string }[];
  responses?: { id: string }[];
  createdAt?: string;
}

const credibilityColors: Record<string, { color: string; bg: string; pct: number }> = {
  New: { color: '#888780', bg: '#F1EFE8', pct: 15 },
  Growing: { color: '#B45309', bg: '#FEF3C7', pct: 40 },
  Established: { color: '#2C2C6E', bg: '#EEEDFE', pct: 70 },
  Trusted: { color: '#0F6E56', bg: '#E1F5EE', pct: 95 },
};

function credibilityLabel(score: number): string {
  if (score >= 75) return 'Trusted';
  if (score >= 40) return 'Established';
  if (score >= 15) return 'Growing';
  return 'New';
}

function EditProfilePanel({ user, onSave }: { user: ProfileUser; onSave: () => void }) {
  const [name, setName] = useState(user.name);
  const [emailNotifMatch, setEmailNotifMatch] = useState(true);
  const [emailNotifUpvote, setEmailNotifUpvote] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  return (
    <div className="bg-white rounded-xl border p-6" style={{ borderColor: '#DEDEDE' }}>
      <h2 className="mb-5" style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A' }}>Edit profile</h2>

      {/* Photo upload */}
      <div className="flex items-center gap-4 mb-6">
        <AvatarCircle name={name} size="profile" />
        <label className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors text-[13px]" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
          <Upload size={14} /> Upload photo
          <input type="file" className="hidden" accept="image/*" />
        </label>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
        </div>

        {user.institution && (
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Institution</label>
            <input defaultValue={user.institution} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
            <p className="text-[11px] mt-1 flex items-center gap-1" style={{ color: '#B45309' }}>
              <AlertTriangle size={11} />
              Changing institution will clear your verified badge and require re-submission.
            </p>
          </div>
        )}

        {user.programme && (
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Programme</label>
            <input defaultValue={user.programme} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]" style={{ borderColor: '#DEDEDE' }} />
          </div>
        )}
      </div>

      {/* Notification preferences */}
      <div className="mb-6">
        <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Notification preferences</h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={emailNotifMatch} onChange={e => setEmailNotifMatch(e.target.checked)} />
            <span className="text-[13px]" style={{ color: '#5F5E5A' }}>Email me when a matched question is posted</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={emailNotifUpvote} onChange={e => setEmailNotifUpvote(e.target.checked)} />
            <span className="text-[13px]" style={{ color: '#5F5E5A' }}>Email me when my response is upvoted</span>
          </label>
        </div>
      </div>

      <button onClick={() => { onSave(); toast.success('Profile updated.'); }} className="w-full py-2.5 rounded-lg text-[14px] font-medium text-white flex items-center justify-center gap-2 mb-8" style={{ backgroundColor: '#2C2C6E' }}>
        <Save size={15} /> Save changes
      </button>

      {/* Danger zone */}
      <div className="border rounded-lg p-4" style={{ borderColor: '#D85A30' }}>
        <h3 className="text-[14px] font-medium mb-2" style={{ color: '#D85A30' }}>Danger zone</h3>
        <p className="text-[12px] mb-3" style={{ color: '#5F5E5A' }}>To permanently delete your account, type DELETE below.</p>
        <div className="flex gap-2">
          <input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} placeholder="Type DELETE to confirm" className="flex-1 px-3 py-2 rounded-lg border text-[13px] outline-none" style={{ borderColor: '#DEDEDE' }} />
          <button disabled={deleteConfirm !== 'DELETE'} className="px-3 py-2 rounded-lg border text-[12px] font-medium disabled:opacity-40" style={{ borderColor: '#D85A30', color: '#D85A30' }}>
            Delete account
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser } = useApp();
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [userQuestions, setUserQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);

    // Try advisor profile first, then student
    profileApi.getAdvisorProfile(userId)
      .then(r => {
        const p = r.data.data;
        setUser({
          id: p.user.id,
          name: p.user.fullName,
          email: p.user.email,
          role: 'advisor',
          institution: p.institutions?.[0]?.name,
          programme: p.programme,
          yearEntry: p.yearOfEntry,
          yearGrad: p.yearOfGraduation,
          isVerified: p.isVerified,
          credibilityScore: p.credibilityScore,
          totalUpvotes: p.totalUpvotes,
          tags: p.tags?.map((t: { name: string }) => t.name) ?? [],
          joinDate: new Date(p.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        });
      })
      .catch(() => {
        profileApi.getStudentProfile(userId)
          .then(r => {
            const p = r.data.data;
            setUser({
              id: p.user.id,
              name: p.user.fullName,
              email: p.user.email,
              role: 'student',
              interests: p.tags?.map((t: { name: string }) => t.name) ?? [],
              joinDate: new Date(p.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            });
          })
          .catch(() => {});
      })
      .finally(() => setLoading(false));

    questionApi.getQuestions({ userId }).then(r => setUserQuestions(r.data.data.questions ?? [])).catch(() => {});
  }, [userId]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[14px]" style={{ color: '#888780' }}>Loading profile…</p></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[14px]" style={{ color: '#888780' }}>Profile not found.</p></div>;
  }

  const isOwnProfile = currentUser?.id === user.id;

  if (editing && isOwnProfile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 style={{ fontSize: '24px', fontWeight: 500, color: '#1A1A1A' }}>Edit profile</h1>
          <button onClick={() => setEditing(false)} className="text-[13px] hover:underline" style={{ color: '#888780' }}>Cancel</button>
        </div>
        <EditProfilePanel user={user} onSave={() => setEditing(false)} />
      </div>
    );
  }

  const credibility = credibilityLabel(user.credibilityScore ?? 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: '#DEDEDE' }}>
            <div className="flex items-start gap-3 mb-4">
              <AvatarCircle name={user.name} size="profile" />
              <div className="flex-1 min-w-0">
                <h1 className="mb-1" style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A' }}>{user.name}</h1>
                {user.isVerified && <VerifiedBadge type="alumnus" />}
                <p className="text-[12px] mt-1" style={{ color: '#888780' }}>Member since {user.joinDate}</p>
              </div>
              {isOwnProfile && (
                <button onClick={() => setEditing(true)} className="p-2 rounded-lg border hover:bg-gray-50 transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
                  <Edit2 size={14} />
                </button>
              )}
            </div>

            {user.role === 'advisor' && (
              <>
                <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: '#EEEDFE' }}>
                  {user.institution && <p className="text-[12px] font-medium mb-0.5" style={{ color: '#2C2C6E' }}>Attended {user.institution}</p>}
                  <p className="text-[12px]" style={{ color: '#5F5E5A' }}>{user.programme} · {user.yearEntry}–{user.yearGrad ?? 'present'}</p>
                  {user.isVerified && (
                    <div className="mt-1 flex items-center gap-1 text-[11px]" style={{ color: '#0F6E56' }}>
                      <CheckCircle size={11} /> Verified advisor
                    </div>
                  )}
                </div>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-[12px] mb-1.5" style={{ color: '#5F5E5A' }}>
                    <span>Credibility</span>
                    <span className="font-medium" style={{ color: credibilityColors[credibility]?.color }}>{credibility}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#F7F7FA' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${credibilityColors[credibility]?.pct ?? 15}%`, backgroundColor: credibilityColors[credibility]?.color }} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4 text-center">
                  {[{ label: 'Upvotes', value: user.totalUpvotes ?? 0 }, { label: 'Questions answered', value: userQuestions.length }].map(s => (
                    <div key={s.label} className="p-2 rounded-lg" style={{ backgroundColor: '#F7F7FA' }}>
                      <div className="text-[16px] font-medium" style={{ color: '#2C2C6E' }}>{s.value}</div>
                      <div className="text-[11px]" style={{ color: '#888780' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {(user.tags?.length || user.interests?.length) ? (
              <div>
                <p className="text-[12px] font-medium mb-2" style={{ color: '#5F5E5A' }}>{user.role === 'advisor' ? 'Advisory tags' : 'Interests'}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(user.tags ?? user.interests ?? []).map(t => <TagPill key={t} label={t} />)}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="mb-3" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>
              {user.role === 'advisor' ? 'Questions answered' : 'Questions asked'}
            </h2>
            {userQuestions.length === 0 ? (
              <div className="bg-white rounded-xl border p-6 text-center" style={{ borderColor: '#DEDEDE' }}>
                <p className="text-[13px]" style={{ color: '#888780' }}>No questions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {userQuestions.map(q => (
                  <Link key={q.id} to={`/questions/${q.id}`} className="block bg-white rounded-xl border p-4 hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                    <p className="text-[13px] font-medium mb-2" style={{ color: '#1A1A1A' }}>{q.title}</p>
                    <div className="flex items-center gap-2">
                      {q.institution && <TagPill label={q.institution.name} />}
                      <span className="text-[12px]" style={{ color: '#888780' }}>{q.responses?.length ?? 0} responses</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
