import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Share2, ThumbsUp, Flag, CheckCircle, ChevronRight, AlertTriangle, X, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { SentimentBadge } from '../components/shared/SentimentBadge';
import { VerifiedBadge } from '../components/shared/VerifiedBadge';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { EmptyState } from '../components/shared/EmptyState (1)';
import { questions, responses, institutions, Response, SentimentType } from '../data/mockData';
import { toast } from 'sonner';

function ResponseCard({ r, onUpvote }: { r: Response; onUpvote: (id: string) => void }) {
  const [upvoted, setUpvoted] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);

  const borderColor = r.sentiment === 'positive' ? '#0F6E56' : r.sentiment === 'critical' ? '#D85A30' : '#888780';

  const handleUpvote = () => {
    if (!upvoted) {
      setUpvoted(true);
      onUpvote(r.id);
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
      <div className="flex" style={{ borderLeft: `3px solid ${borderColor}` }}>
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <AvatarCircle name={r.advisorName} size="card" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{r.advisorName}</span>
                  <VerifiedBadge type={r.isVerified ? 'alumnus' : 'unverified'} />
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: '#888780' }}>
                  {r.programme} · {r.institution} · Graduated {r.yearGrad}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SentimentBadge sentiment={r.sentiment} size="sm" />
              <span className="text-[12px]" style={{ color: '#888780' }}>{r.timeAgo}</span>
            </div>
          </div>

          {/* Recency warning */}
          {r.recencyWarning && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-[12px]" style={{ backgroundColor: '#FEF3C7', color: '#B45309' }}>
              <AlertTriangle size={13} />
              This advisor attended in {r.yearGrad - 4}. Conditions may have changed.
            </div>
          )}

          {!r.isVerified && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg text-[12px]" style={{ backgroundColor: '#F7F7FA', color: '#888780' }}>
              This response is from an unverified advisor.
            </div>
          )}

          {/* Body */}
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: '#1A1A1A', lineHeight: '1.6' }}>{r.body}</p>

          {(r.whatWorked || r.whatCouldImprove) && (
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {r.whatWorked && (
                <div className="rounded-lg p-3 text-[12px]" style={{ backgroundColor: '#E1F5EE' }}>
                  <p className="font-medium mb-1" style={{ color: '#0F6E56' }}>What worked well</p>
                  <p style={{ color: '#1A1A1A' }}>{r.whatWorked}</p>
                </div>
              )}
              {r.whatCouldImprove && (
                <div className="rounded-lg p-3 text-[12px]" style={{ backgroundColor: '#F7F7FA' }}>
                  <p className="font-medium mb-1" style={{ color: '#5F5E5A' }}>What could be better</p>
                  <p style={{ color: '#1A1A1A' }}>{r.whatCouldImprove}</p>
                </div>
              )}
            </div>
          )}

          {r.wouldRecommend && (
            <p className="text-[12px] mb-3" style={{ color: '#5F5E5A' }}>
              Would recommend: <strong style={{ color: r.wouldRecommend === 'yes' ? '#0F6E56' : r.wouldRecommend === 'no' ? '#D85A30' : '#888780' }}>
                {r.wouldRecommend === 'yes' ? 'Yes' : r.wouldRecommend === 'no' ? 'No' : 'It depends'}
              </strong>
            </p>
          )}

          {/* Footer actions */}
          <div className="flex items-center gap-3">
            <button onClick={handleUpvote} className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border transition-colors ${upvoted ? 'border-[#0F6E56] text-[#0F6E56] bg-[#E1F5EE]' : ''}`} style={{ borderColor: upvoted ? '#0F6E56' : '#DEDEDE', color: upvoted ? '#0F6E56' : '#888780' }}>
              <ThumbsUp size={13} fill={upvoted ? 'currentColor' : 'none'} />
              {r.upvotes + (upvoted ? 1 : 0)}
            </button>
            <div className="relative">
              <button onClick={() => setFlagOpen(v => !v)} className="flex items-center gap-1 text-[12px] px-2 py-1.5 rounded-lg border transition-colors hover:text-red-500" style={{ borderColor: '#DEDEDE', color: '#888780' }}>
                <Flag size={12} />
                Flag
              </button>
              {flagOpen && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border z-10 w-40" style={{ borderColor: '#DEDEDE' }}>
                  {['Biased', 'Outdated', 'Offensive', 'Spam'].map(reason => (
                    <button key={reason} onClick={() => { toast.success('Response flagged for review.'); setFlagOpen(false); }} className="w-full text-left px-3 py-2 text-[12px] hover:bg-gray-50 border-b last:border-0 transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SubmitResponseModal({ questionId, onClose }: { questionId: string; onClose: () => void }) {
  const { currentUser } = useApp();
  const [body, setBody] = useState('');
  const [whatWorked, setWhatWorked] = useState('');
  const [whatCouldImprove, setWhatCouldImprove] = useState('');
  const [recommend, setRecommend] = useState<'yes' | 'no' | 'it_depends' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = body.trim() && recommend;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
    await new Promise(r => setTimeout(r, 1500));
    toast.success('Response submitted. Thank you for helping!');
    onClose();
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl p-6 text-center max-w-sm w-full">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: '#E1F5EE' }}>
            <CheckCircle size={24} style={{ color: '#0F6E56' }} />
          </div>
          <p className="text-[14px] font-medium mb-1" style={{ color: '#1A1A1A' }}>Response submitted!</p>
          <p className="text-[13px]" style={{ color: '#5F5E5A' }}>Your response is being classified — it will appear shortly with a sentiment label.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#DEDEDE' }}>
          <h2 className="text-[16px] font-medium" style={{ color: '#1A1A1A' }}>Share your experience</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 transition-colors" style={{ color: '#888780' }}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {currentUser && (
            <div className="flex items-center gap-2 p-3 rounded-lg text-[12px]" style={{ backgroundColor: '#EEEDFE' }}>
              <AvatarCircle name={currentUser.name} size="sm" />
              <span style={{ color: '#5F5E5A' }}>Responding as: <strong style={{ color: '#2C2C6E' }}>{currentUser.name} · {currentUser.programme ?? ''} · {currentUser.institution ?? ''}</strong></span>
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Your experience <span style={{ color: '#D85A30' }}>*</span></label>
            <div className="relative">
              <textarea
                value={body}
                onChange={e => setBody(e.target.value.slice(0, 1200))}
                placeholder="Share what you know — be as specific as possible."
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] resize-y"
                style={{ borderColor: '#DEDEDE' }}
              />
              <span className="absolute right-2 bottom-2 text-[11px]" style={{ color: '#888780' }}>{body.length}/1200</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>What worked well? <span style={{ color: '#888780', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={whatWorked} onChange={e => setWhatWorked(e.target.value)} placeholder="Strengths of the programme, lecturers, facilities…" rows={2} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] resize-y" style={{ borderColor: '#DEDEDE' }} />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>What could be better? <span style={{ color: '#888780', fontWeight: 400 }}>(optional)</span></label>
            <textarea value={whatCouldImprove} onChange={e => setWhatCouldImprove(e.target.value)} placeholder="Honest constructive points…" rows={2} className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] resize-y" style={{ borderColor: '#DEDEDE' }} />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-2" style={{ color: '#1A1A1A' }}>Would you recommend? <span style={{ color: '#D85A30' }}>*</span></label>
            <div className="flex gap-2">
              {[{ value: 'yes' as const, label: 'Yes', color: '#0F6E56', bg: '#E1F5EE' }, { value: 'no' as const, label: 'No', color: '#D85A30', bg: '#FAECE7' }, { value: 'it_depends' as const, label: 'It depends', color: '#888780', bg: '#F1EFE8' }].map(opt => (
                <button key={opt.value} type="button" onClick={() => setRecommend(opt.value)} className={`flex-1 py-2 rounded-lg border-2 text-[13px] font-medium transition-colors`} style={{ borderColor: recommend === opt.value ? opt.color : '#DEDEDE', backgroundColor: recommend === opt.value ? opt.bg : '#fff', color: recommend === opt.value ? opt.color : '#5F5E5A' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={!canSubmit || submitting} className="w-full py-3 rounded-lg text-[14px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-40" style={{ backgroundColor: '#2C2C6E' }}>
            {submitting && <Loader2 size={15} className="animate-spin" />}
            Submit response
          </button>
        </form>
      </div>
    </div>
  );
}

export default function QuestionThreadPage() {
  const { id } = useParams();
  const { isAuthenticated, currentUser } = useApp();
  const [activeFilter, setActiveFilter] = useState<'all' | SentimentType>('all');
  const [sortOrder, setSortOrder] = useState('Top rated');
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);

  const question = questions.find(q => q.id === id) ?? questions[0];
  const institution = institutions.find(i => i.id === question.institutionId);
  const threadResponses = responses.filter(r => r.questionId === question.id);

  const filteredResponses = activeFilter === 'all' ? threadResponses : threadResponses.filter(r => r.sentiment === activeFilter);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.info('Link copied!');
  };

  const counts = {
    all: threadResponses.length,
    positive: threadResponses.filter(r => r.sentiment === 'positive').length,
    neutral: threadResponses.filter(r => r.sentiment === 'neutral').length,
    critical: threadResponses.filter(r => r.sentiment === 'critical').length,
  };

  const relatedQuestions = questions.filter(q => q.id !== question.id && (q.institutionId === question.institutionId || q.tags.some(t => question.tags.includes(t)))).slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex gap-6">
        {/* Main column */}
        <div className="flex-1 min-w-0">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] mb-4" style={{ color: '#888780' }}>
            <Link to="/" className="hover:underline" style={{ color: '#2C2C6E' }}>Home</Link>
            <ChevronRight size={12} />
            <Link to={`/institutions/${question.institutionId}`} className="hover:underline" style={{ color: '#2C2C6E' }}>{question.institutionName}</Link>
            <ChevronRight size={12} />
            <span className="truncate">{question.programme ?? question.tags[0]}</span>
          </nav>

          {/* Question card */}
          <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#DEDEDE' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A', lineHeight: '1.4' }}>{question.title}</h1>
              {(isAnswered || question.isAnswered) && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] flex-shrink-0" style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}>
                  <CheckCircle size={12} /> Answered
                </span>
              )}
            </div>
            <p className="text-[13px] leading-relaxed mb-4" style={{ color: '#1A1A1A', lineHeight: '1.6' }}>{question.body}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {question.tags.map(t => <TagPill key={t} label={t} />)}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <AvatarCircle name={question.askerName} size="sm" />
                <span className="text-[12px]" style={{ color: '#5F5E5A' }}>Asked by {question.askerName} · {question.timeAgo}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] hover:bg-gray-50 transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
                  <Share2 size={13} /> Share
                </button>
                {isAuthenticated && currentUser?.id === question.askerId && (
                  <button onClick={() => setIsAnswered(v => !v)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] hover:bg-gray-50 transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
                    <CheckCircle size={13} /> {isAnswered || question.isAnswered ? 'Unmark as answered' : 'Mark as answered'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Sentiment filter bar */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-[13px]" style={{ color: '#5F5E5A' }}>{threadResponses.length} response{threadResponses.length !== 1 ? 's' : ''}</span>
              <div className="flex gap-1.5">
                {(['all', 'positive', 'neutral', 'critical'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-full text-[12px] border transition-colors`}
                    style={{
                      borderColor: activeFilter === f ? '#2C2C6E' : '#DEDEDE',
                      backgroundColor: activeFilter === f ? '#2C2C6E' : '#fff',
                      color: activeFilter === f ? '#fff' : '#5F5E5A',
                    }}
                  >
                    {f === 'all' ? `All (${counts.all})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f]})`}
                  </button>
                ))}
              </div>
            </div>
            <select value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="px-2 py-1.5 rounded-lg border text-[12px] outline-none" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
              {['Top rated', 'Most recent', 'Oldest first'].map(o => <option key={o}>{o}</option>)}
            </select>
          </div>

          {/* Responses */}
          {filteredResponses.length === 0 ? (
            <EmptyState
              heading="No responses yet"
              message="Be the first to share your experience."
              cta={
                isAuthenticated
                  ? <button onClick={() => setShowResponseModal(true)} className="px-4 py-2 rounded-lg font-medium text-white text-[13px]" style={{ backgroundColor: '#2C2C6E' }}>Add response</button>
                  : <Link to="/login" className="px-4 py-2 rounded-lg font-medium text-white text-[13px]" style={{ backgroundColor: '#2C2C6E' }}>Log in to respond</Link>
              }
            />
          ) : (
            <div className="space-y-4">
              {filteredResponses.map(r => (
                <ResponseCard key={r.id} r={r} onUpvote={rid => setUpvotedIds(p => [...p, rid])} />
              ))}
            </div>
          )}

          {/* Notified count */}
          {threadResponses.length > 0 && (
            <div className="mt-4 p-3 rounded-lg text-[12px]" style={{ backgroundColor: '#EEEDFE', color: '#5F5E5A' }}>
              {threadResponses.length} advisor{threadResponses.length !== 1 ? 's' : ''} with relevant experience have been notified.
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block w-72 flex-shrink-0 space-y-4">
          {/* Institution card */}
          {institution && (
            <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
              <h3 className="text-[14px] font-medium mb-2" style={{ color: '#1A1A1A' }}>{institution.name}</h3>
              <div className="space-y-1 text-[12px] mb-3" style={{ color: '#5F5E5A' }}>
                <div>{institution.country}</div>
                <div className="capitalize">{institution.type}</div>
                <div>{institution.questions} questions · {institution.advisors} advisors</div>
              </div>
              <Link to={`/institutions/${institution.id}`} className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>View all questions →</Link>
            </div>
          )}

          {/* Sentiment overview */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Response sentiment</h3>
            {[
              { label: 'Positive', count: question.sentimentCounts.positive, total: threadResponses.length, color: '#0F6E56', bg: '#E1F5EE' },
              { label: 'Neutral', count: question.sentimentCounts.neutral, total: threadResponses.length, color: '#5F5E5A', bg: '#F1EFE8' },
              { label: 'Critical', count: question.sentimentCounts.critical, total: threadResponses.length, color: '#D85A30', bg: '#FAECE7' },
            ].map(s => {
              const pct = threadResponses.length > 0 ? Math.round((s.count / threadResponses.length) * 100) : 0;
              return (
                <div key={s.label} className="mb-2.5">
                  <div className="flex items-center justify-between text-[12px] mb-1" style={{ color: '#5F5E5A' }}>
                    <span>{s.label}</span><span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ backgroundColor: '#F7F7FA' }}>
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Related questions */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Related questions</h3>
            <div className="space-y-2">
              {relatedQuestions.map(q => (
                <Link key={q.id} to={`/questions/${q.id}`} className="block text-[12px] hover:underline leading-relaxed" style={{ color: '#2C2C6E' }}>{q.title}</Link>
              ))}
            </div>
          </div>

          {/* Add perspective */}
          {isAuthenticated ? (
            <button onClick={() => setShowResponseModal(true)} className="w-full py-2.5 rounded-lg text-[13px] font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#2C2C6E' }}>
              Add your perspective
            </button>
          ) : (
            <Link to="/login" className="block text-center py-2.5 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>
              Log in to respond
            </Link>
          )}
        </div>
      </div>

      {/* Mobile respond button */}
      {isAuthenticated && (
        <div className="lg:hidden fixed bottom-4 right-4">
          <button onClick={() => setShowResponseModal(true)} className="px-5 py-3 rounded-full text-[13px] font-medium text-white shadow-lg" style={{ backgroundColor: '#2C2C6E' }}>
            + Add your perspective
          </button>
        </div>
      )}

      {showResponseModal && question && (
        <SubmitResponseModal questionId={question.id} onClose={() => setShowResponseModal(false)} />
      )}
    </div>
  );
}
