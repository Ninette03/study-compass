import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { MessageSquare, Plus, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { SentimentBadge } from '../components/shared/SentimentBadge';
import { EmptyState } from '../components/shared/EmptyState (1).tsx';
import { questionApi, publicApi, profileApi } from '../api';

interface Question {
  id: string;
  title: string;
  institution?: { name: string };
  tags: { name: string }[];
  responses?: { id: string; sentiment?: string }[];
  createdAt?: string;
}

function timeAgo(dateStr?: string) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function StatusBadge({ isAnswered }: { isAnswered: boolean }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] flex-shrink-0" style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}>
      {isAnswered ? 'Answered' : 'Unanswered'}
    </span>
  );
}

function QuestionCard({ q }: { q: Question }) {
  const responseCount = q.responses?.length ?? 0;
  return (
    <Link to={`/questions/${q.id}`} className="block p-4 bg-white rounded-lg border hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate" style={{ color: '#1A1A1A' }}>{q.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            {q.institution && <TagPill label={q.institution.name} />}
            {q.tags.slice(0, 2).map(t => <TagPill key={t.name} label={t.name} />)}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <StatusBadge isAnswered={responseCount > 0} />
          <div className="mt-1 text-[12px]" style={{ color: '#888780' }}>{responseCount} response{responseCount !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Clock size={12} style={{ color: '#888780' }} />
        <span className="text-[12px]" style={{ color: '#888780' }}>{timeAgo(q.createdAt)}</span>
      </div>
    </Link>
  );
}

function StudentDashboard() {
  const { currentUser } = useApp();
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState<Question[]>([]);
  const [institutions, setInstitutions] = useState<{ id: string; name: string }[]>([]);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (!currentUser) return;
    questionApi.getQuestions({ userId: currentUser.id }).then(r => setMyQuestions(r.data.data.questions ?? [])).catch(() => {});
    questionApi.getQuestions({ take: 3 }).then(r => setSuggestedQuestions(r.data.data.questions ?? [])).catch(() => {});
    publicApi.getInstitutions({ take: 5 }).then(r => setInstitutions(r.data.data.institutions ?? [])).catch(() => {});
  }, [currentUser?.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="rounded-xl p-6 mb-8 text-white" style={{ background: 'linear-gradient(135deg, #2C2C6E 0%, #3d3d8e 100%)' }}>
        <p className="text-[18px] font-medium mb-1">{greeting}, {currentUser?.name.split(' ')[0]}!</p>
        <p className="text-white/75 text-[13px]">What would you like to know today?</p>
      </div>

      <div className="bg-white rounded-xl border p-6 mb-8 flex items-center justify-between" style={{ borderColor: '#DEDEDE' }}>
        <div>
          <p className="text-[15px] font-medium mb-1" style={{ color: '#1A1A1A' }}>Have a question?</p>
          <p className="text-[13px]" style={{ color: '#5F5E5A' }}>Get honest answers from verified alumni and current students.</p>
        </div>
        <Link to="/ask" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium text-white flex-shrink-0" style={{ backgroundColor: '#2C2C6E' }}>
          <Plus size={15} /> Ask a question
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>My questions</h2>
              <span className="text-[12px]" style={{ color: '#888780' }}>{myQuestions.length} total</span>
            </div>
            {myQuestions.length === 0 ? (
              <EmptyState icon={<MessageSquare size={24} />} heading="No questions yet" message="You haven't asked any questions yet."
                cta={<Link to="/ask" className="px-4 py-2 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>Ask your first question</Link>} />
            ) : (
              <div className="space-y-3">{myQuestions.map(q => <QuestionCard key={q.id} q={q} />)}</div>
            )}
          </section>

          <section>
            <h2 className="mb-3" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>Questions you might be interested in</h2>
            <div className="space-y-3">
              {suggestedQuestions.map(q => (
                <Link key={q.id} to={`/questions/${q.id}`} className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{q.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {q.institution && <TagPill label={q.institution.name} size="default" />}
                      <span className="text-[12px]" style={{ color: '#888780' }}>{q.responses?.length ?? 0} responses</span>
                    </div>
                  </div>
                  <ChevronRight size={15} style={{ color: '#888780' }} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-5">
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="mb-3 text-[14px] font-medium" style={{ color: '#1A1A1A' }}>Recently active institutions</h3>
            <div className="flex flex-wrap gap-1.5">
              {institutions.map(inst => (
                <Link key={inst.id} to={`/institutions/${inst.id}`}><TagPill label={inst.name} interactive /></Link>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="mb-3 text-[14px] font-medium" style={{ color: '#1A1A1A' }}>Quick links</h3>
            <div className="space-y-2">
              {[{ label: 'Browse all questions', path: '/questions' }, { label: 'View my profile', path: `/profile/${currentUser?.id}` }, { label: 'Notifications', path: '/notifications' }].map(l => (
                <Link key={l.label} to={l.path} className="flex items-center justify-between py-1.5 text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>
                  {l.label} <ChevronRight size={13} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdvisorDashboard() {
  const { currentUser } = useApp();
  const [matchedQuestions, setMatchedQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState({ responses: 0, upvotes: 0, helped: 0 });
  const [isVerified, setIsVerified] = useState(false);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (!currentUser) return;
    questionApi.getQuestions({ take: 10 }).then(r => setMatchedQuestions(r.data.data.questions ?? [])).catch(() => {});
    profileApi.getAdvisorProfile(currentUser.id).then(r => {
      const p = r.data.data;
      setIsVerified(p.isVerified ?? false);
      setStats({ responses: 0, upvotes: p.totalUpvotes ?? 0, helped: 0 });
    }).catch(() => {});
  }, [currentUser?.id]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="rounded-xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, #2C2C6E 0%, #3d3d8e 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[18px] font-medium text-white mb-1">{greeting}, {currentUser?.name.split(' ')[0]}!</p>
            <div className="flex items-center gap-2">
              {!isVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>Verify your profile</span>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {[{ value: stats.responses, label: 'Responses' }, { value: stats.upvotes, label: 'Upvotes' }, { value: stats.helped, label: 'Students helped' }].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-[20px] font-medium text-white">{s.value}</div>
                <div className="text-[11px] text-white/60">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center gap-2" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>
                Questions waiting for your expertise
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>{matchedQuestions.length}</span>
              </h2>
            </div>
            {matchedQuestions.length === 0 ? (
              <EmptyState icon={<MessageSquare size={24} />} heading="All caught up!" message="No new matched questions right now."
                cta={<Link to="/questions" className="text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>Browse all questions</Link>} />
            ) : (
              <div className="space-y-3">
                {matchedQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-lg border p-4" style={{ borderColor: '#DEDEDE' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{q.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {q.institution && <TagPill label={q.institution.name} />}
                          {q.tags.slice(0, 3).map(t => <TagPill key={t.name} label={t.name} />)}
                          <span className="text-[12px]" style={{ color: '#888780' }}>{timeAgo(q.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link to={`/questions/${q.id}`} className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>Respond</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <div className="flex items-center gap-3 mb-4">
              <AvatarCircle name={currentUser?.name ?? ''} size="card" />
              <div>
                <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{currentUser?.name}</p>
                <p className="text-[12px]" style={{ color: '#5F5E5A' }}>{currentUser?.role.toUpperCase()}</p>
              </div>
            </div>
            <Link to={`/profile/${currentUser?.id}`} className="block text-center py-2 rounded-lg border text-[13px]" style={{ borderColor: '#DEDEDE', color: '#2C2C6E' }}>View profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, isAuthenticated } = useApp();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[15px]" style={{ color: '#5F5E5A' }}>You need to be logged in to view your dashboard.</p>
        <Link to="/login" className="px-5 py-2.5 rounded-lg font-medium text-white text-[13px]" style={{ backgroundColor: '#2C2C6E' }}>Log in</Link>
      </div>
    );
  }

  if (currentUser?.role === 'admin') {
    navigate('/admin');
    return null;
  }

  return currentUser?.role === 'advisor' ? <AdvisorDashboard /> : <StudentDashboard />;
}
