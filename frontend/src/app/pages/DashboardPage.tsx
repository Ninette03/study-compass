import { Link, useNavigate } from 'react-router';
import { MessageSquare, Plus, ChevronRight, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { SentimentBadge } from '../components/shared/SentimentBadge';
import { EmptyState } from '../components/shared/EmptyState (1).tsx';
import { questions, matchedQuestions, institutions, Question } from '../data/mockData';

function StatusBadge({ isAnswered }: { isAnswered: boolean }) {
  if (isAnswered) {
    return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium" style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}>Answered</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border" style={{ borderColor: '#F59E0B', color: '#B45309', borderWidth: '0.5px' }}>Open — awaiting responses</span>;
}

function QuestionCard({ q }: { q: Question }) {
  return (
    <Link to={`/questions/${q.id}`} className="block p-4 bg-white rounded-lg border hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium truncate" style={{ color: '#1A1A1A' }}>{q.title}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <TagPill label={q.institutionName} />
            {q.tags.slice(0, 2).map(t => <TagPill key={t} label={t} />)}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <StatusBadge isAnswered={q.isAnswered} />
          <div className="mt-1 text-[12px]" style={{ color: '#888780' }}>{q.responseCount} response{q.responseCount !== 1 ? 's' : ''}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-2">
        <Clock size={12} style={{ color: '#888780' }} />
        <span className="text-[12px]" style={{ color: '#888780' }}>{q.timeAgo}</span>
      </div>
    </Link>
  );
}

function StudentDashboard() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const myQuestions = questions.filter(q => q.askerId === '1');
  const suggestedQuestions = questions.filter(q => q.askerId !== '1').slice(0, 3);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome banner */}
      <div className="rounded-xl p-6 mb-8 text-white" style={{ background: 'linear-gradient(135deg, #2C2C6E 0%, #3d3d8e 100%)' }}>
        <p className="text-[18px] font-medium mb-1">{greeting}, {currentUser?.name.split(' ')[0]}!</p>
        <p className="text-white/75 text-[13px]">What would you like to know today?</p>
      </div>

      {/* Ask CTA */}
      <div className="bg-white rounded-xl border p-6 mb-8 flex items-center justify-between" style={{ borderColor: '#DEDEDE' }}>
        <div>
          <p className="text-[15px] font-medium mb-1" style={{ color: '#1A1A1A' }}>Have a question?</p>
          <p className="text-[13px]" style={{ color: '#5F5E5A' }}>Get honest answers from verified alumni and current students.</p>
        </div>
        <Link to="/ask" className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium text-white flex-shrink-0" style={{ backgroundColor: '#2C2C6E' }}>
          <Plus size={15} />
          Ask a question
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* My questions */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>My questions</h2>
              <span className="text-[12px]" style={{ color: '#888780' }}>{myQuestions.length} total</span>
            </div>
            {myQuestions.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={24} />}
                heading="No questions yet"
                message="You haven't asked any questions yet."
                cta={<Link to="/ask" className="px-4 py-2 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>Ask your first question</Link>}
              />
            ) : (
              <div className="space-y-3">
                {myQuestions.map(q => <QuestionCard key={q.id} q={q} />)}
              </div>
            )}
          </section>

          {/* Suggested */}
          <section>
            <h2 className="mb-3" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>Questions you might be interested in</h2>
            <div className="space-y-3">
              {suggestedQuestions.map(q => (
                <Link key={q.id} to={`/questions/${q.id}`} className="flex items-start gap-3 p-3 bg-white rounded-lg border hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{q.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <TagPill label={q.institutionName} size="default" />
                      <span className="text-[12px]" style={{ color: '#888780' }}>{q.responseCount} responses</span>
                    </div>
                  </div>
                  <ChevronRight size={15} style={{ color: '#888780' }} />
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Recently active institutions */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="mb-3 text-[14px] font-medium" style={{ color: '#1A1A1A' }}>Recently active institutions</h3>
            <div className="flex flex-wrap gap-1.5">
              {institutions.slice(0, 5).map(inst => (
                <Link key={inst.id} to={`/institutions/${inst.id}`}>
                  <TagPill label={inst.name} interactive />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="mb-3 text-[14px] font-medium" style={{ color: '#1A1A1A' }}>Quick links</h3>
            <div className="space-y-2">
              {[
                { label: 'Browse all questions', path: '/questions' },
                { label: 'View my profile', path: '/profile/1' },
                { label: 'Notifications', path: '/notifications' },
              ].map(l => (
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
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const stats = currentUser?.stats ?? { responses: 0, upvotes: 0, helped: 0 };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Welcome + credibility */}
      <div className="rounded-xl p-6 mb-8" style={{ background: 'linear-gradient(135deg, #2C2C6E 0%, #3d3d8e 100%)' }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[18px] font-medium text-white mb-1">{greeting}, {currentUser?.name.split(' ')[0]}!</p>
            <div className="flex items-center gap-2">
              {currentUser?.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}>
                  ✓ Verified advisor
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
                  Pending verification
                </span>
              )}
              <span className="text-white/70 text-[12px]">Credibility: {currentUser?.credibility}</span>
            </div>
          </div>
          <div className="flex gap-4">
            {[
              { value: stats.responses, label: 'Responses' },
              { value: stats.upvotes, label: 'Upvotes' },
              { value: stats.helped, label: 'Students helped' },
            ].map(s => (
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
          {/* Matched questions */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="flex items-center gap-2" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>
                Questions waiting for your expertise
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>{matchedQuestions.length}</span>
              </h2>
            </div>
            {matchedQuestions.length === 0 ? (
              <EmptyState
                icon={<MessageSquare size={24} />}
                heading="All caught up!"
                message="No new matched questions right now."
                cta={<Link to="/questions" className="text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>Browse all questions</Link>}
              />
            ) : (
              <div className="space-y-3">
                {matchedQuestions.map(q => (
                  <div key={q.id} className="bg-white rounded-lg border p-4" style={{ borderColor: '#DEDEDE' }}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{q.title}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <TagPill label={q.institutionName} />
                          {q.tags.map(t => <TagPill key={t} label={t} />)}
                          <span className="text-[12px]" style={{ color: '#888780' }}>{q.timeAgo}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link to={`/questions/${q.id}`} className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>
                          Respond
                        </Link>
                        <button className="px-2 py-1.5 rounded-lg border text-[12px]" style={{ borderColor: '#DEDEDE', color: '#888780' }}>
                          ···
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* My responses */}
          <section>
            <h2 className="mb-3" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>My responses</h2>
            <div className="space-y-3">
              {questions.slice(0, 3).map(q => (
                <Link key={q.id} to={`/questions/${q.id}`} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{q.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <SentimentBadge sentiment={q.sentiment} size="sm" />
                      <span className="text-[12px]" style={{ color: '#888780' }}>↑ {q.responseCount * 6} upvotes · {q.timeAgo}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Profile summary card */}
        <div>
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <div className="flex items-center gap-3 mb-4">
              <AvatarCircle name={currentUser?.name ?? ''} size="card" />
              <div>
                <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{currentUser?.name}</p>
                <p className="text-[12px]" style={{ color: '#5F5E5A' }}>{currentUser?.programme}</p>
                <p className="text-[12px]" style={{ color: '#5F5E5A' }}>{currentUser?.institution}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-4">
              {(currentUser?.tags ?? []).slice(0, 4).map(t => <TagPill key={t} label={t} size="default" />)}
            </div>
            <Link to={`/profile/${currentUser?.id}`} className="block text-center py-2 rounded-lg border text-[13px]" style={{ borderColor: '#DEDEDE', color: '#2C2C6E' }}>
              Edit profile
            </Link>
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
