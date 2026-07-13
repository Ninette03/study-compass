import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router';
import { Share2, ThumbsUp, Flag, CheckCircle, ChevronRight, AlertTriangle, X, Loader2, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { SentimentBadge } from '../components/shared/SentimentBadge';
import type { SentimentType } from '../types';
import { VerifiedBadge } from '../components/shared/VerifiedBadge';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { EmptyState } from '../components/shared/EmptyState (1)';
import { questionApi, messageApi } from '../api';
import { toast } from 'sonner';

interface Question {
  id: string;
  title: string;
  body: string;
  institutionId: string;
  institution?: { name: string; country: string };
  programme: string | null;
  tags: Array<{ name: string }>;
  user?: { id: string; fullName: string };
  responses?: Response[];
  viewCount?: number;
}

interface Response {
  id: string;
  body: string;
  sentiment: string;
  upvoteCount: number;
  user?: {
    id: string;
    fullName: string;
    profilePhoto?: string;
    advisorProfile?: {
      isVerified: boolean;
      programme: string;
      yearOfEntry: number;
      yearOfGraduation: number;
    };
  };
  createdAt?: string;
}

function ResponseCard({ r, onUpvote, questionOwnerId, questionId }: { r: Response; onUpvote: (id: string) => void; questionOwnerId?: string; questionId?: string }) {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  const [upvoted, setUpvoted] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [startingChat, setStartingChat] = useState(false);
  const borderColor = r.sentiment === 'POSITIVE' ? '#0F6E56' : r.sentiment === 'NEGATIVE' ? '#D85A30' : '#888780';
  const advisorProfile = r.user?.advisorProfile;
  const yearGrad = advisorProfile?.yearOfGraduation ?? new Date().getFullYear();
  const isQuestionOwner = currentUser?.id === questionOwnerId;
  const isOwnResponse = currentUser?.id === r.user?.id;

  const handleMessageAdvisor = async () => {
    if (!r.user?.id || !questionId) return;
    setStartingChat(true);
    try {
      const res = await messageApi.startConversation(questionId, r.user.id);
      navigate(`/messages/${res.data.data.id}`);
    } catch {
      toast.error('Could not start conversation');
    } finally {
      setStartingChat(false);
    }
  };

  const handleUpvote = async () => {
    if (!upvoted) {
      try {
        await questionApi.upvoteResponse(questionId!, r.id);
        setUpvoted(true);
        onUpvote(r.id);
      } catch (err) {
        toast.error('Failed to upvote');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
      <div className="flex" style={{ borderLeft: `3px solid ${borderColor}` }}>
        <div className="flex-1 p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <AvatarCircle name={r.user?.fullName ?? 'Advisor'} size="card" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>{r.user?.fullName}</span>
                  {advisorProfile && <VerifiedBadge type={advisorProfile.isVerified ? 'alumnus' : 'unverified'} />}
                </div>
                <p className="text-[11px] mt-0.5" style={{ color: '#888780' }}>
                  {advisorProfile?.programme} · Graduated {yearGrad}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <SentimentBadge sentiment={r.sentiment.toLowerCase() as SentimentType} size="sm" />
              <span className="text-[12px]" style={{ color: '#888780' }}>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recently'}</span>
            </div>
          </div>

          {/* Body */}
          <p className="text-[13px] leading-relaxed mb-3" style={{ color: '#1A1A1A', lineHeight: '1.6' }}>{r.body}</p>

          {/* Footer actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={handleUpvote}
              className={`flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border transition-colors ${upvoted ? 'border-[#0F6E56] text-[#0F6E56] bg-[#E1F5EE]' : ''}`}
              style={{ borderColor: upvoted ? '#0F6E56' : '#DEDEDE', color: upvoted ? '#0F6E56' : '#888780' }}
            >
              <ThumbsUp size={13} fill={upvoted ? 'currentColor' : 'none'} />
              {r.upvoteCount + (upvoted ? 1 : 0)}
            </button>
            {isQuestionOwner && !isOwnResponse && (
              <button
                onClick={handleMessageAdvisor}
                disabled={startingChat}
                className="flex items-center gap-1.5 text-[12px] px-2.5 py-1.5 rounded-lg border transition-colors hover:border-[#2C2C6E] hover:text-[#2C2C6E] disabled:opacity-50"
                style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}
              >
                {startingChat ? <Loader2 size={12} className="animate-spin" /> : <MessageSquare size={12} />}
                Message advisor
              </button>
            )}
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

function SubmitResponseModal({ questionId, onClose, onSuccess }: { questionId: string; onClose: () => void; onSuccess: () => void }) {
  const { currentUser } = useApp();
  const [body, setBody] = useState('');
  const [programme, setProgramme] = useState('');
  const [yearAttended, setYearAttended] = useState('');
  const [recommend, setRecommend] = useState<'yes' | 'no' | 'it_depends' | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = body.trim() && recommend;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await questionApi.createResponse(questionId, {
        body,
        programme: programme || undefined,
        yearAttended: yearAttended ? parseInt(yearAttended) : undefined,
        wouldRecommend: recommend,
      });
      setSubmitted(true);
      setSubmitting(false);
      await new Promise(r => setTimeout(r, 1500));
      toast.success('Response submitted. Thank you for helping!');
      onClose();
      onSuccess();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to submit response');
      setSubmitting(false);
    }
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
              <span style={{ color: '#5F5E5A' }}>Responding as: <strong style={{ color: '#2C2C6E' }}>{currentUser.name}</strong></span>
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
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Programme <span style={{ color: '#888780', fontWeight: 400 }}>(optional)</span></label>
            <input
              value={programme}
              onChange={e => setProgramme(e.target.value)}
              placeholder="e.g. BSc Computer Science"
              className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]"
              style={{ borderColor: '#DEDEDE' }}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Year attended <span style={{ color: '#888780', fontWeight: 400 }}>(optional)</span></label>
            <input
              type="number"
              value={yearAttended}
              onChange={e => setYearAttended(e.target.value)}
              placeholder="e.g. 2023"
              className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]"
              style={{ borderColor: '#DEDEDE' }}
            />
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
  const [activeFilter, setActiveFilter] = useState<'all' | string>('all');
  const [sortOrder, setSortOrder] = useState('Top rated');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchQuestion = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await questionApi.getQuestion(id, activeFilter === 'all' ? undefined : activeFilter);
        setQuestion(response.data.data);
        setError(null);
      } catch (err: any) {
        setError(err?.response?.data?.message || 'Failed to fetch question');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id, activeFilter, refreshKey]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 size={24} className="animate-spin" style={{ color: '#2C2C6E' }} /></div>;
  }

  if (error || !question) {
    return <EmptyState heading="Question not found" message={error || 'This question could not be loaded.'} />;
  }

  const threadResponses = question.responses || [];
  const counts = { all: threadResponses.length };
  let sorted = [...threadResponses];
  if (sortOrder === 'Top rated') sorted.sort((a, b) => (b.upvoteCount || 0) - (a.upvoteCount || 0));
  else if (sortOrder === 'Most recent') sorted.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 space-y-6">
        {/* Question */}
        <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#DEDEDE' }}>
          <div className="mb-4">
            <h1 className="text-[24px] font-bold mb-2" style={{ color: '#1A1A1A' }}>{question.title}</h1>
            <div className="flex flex-wrap gap-2">
              <TagPill label={question.institution?.name || 'Institution'} interactive />
              {question.tags.slice(0, 5).map((t, i) => <TagPill key={i} label={t.name} />)}
            </div>
          </div>

          <p className="text-[14px] leading-relaxed mb-6" style={{ color: '#5F5E5A' }}>{question.body}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AvatarCircle name={question.user?.fullName ?? 'Asker'} size="card" />
              <div className="text-[12px]">
                <p style={{ color: '#1A1A1A', fontWeight: 500 }}>{question.user?.fullName}</p>
                <p style={{ color: '#888780' }}>{question.viewCount} views</p>
              </div>
            </div>

            {isAuthenticated && currentUser?.id !== question.user?.id && (
              <button
                onClick={() => setShowResponseModal(true)}
                className="px-4 py-2 rounded-lg text-[13px] font-medium text-white transition-colors"
                style={{ backgroundColor: '#2C2C6E' }}
              >
                Answer this question
              </button>
            )}
          </div>
        </div>

        {/* Responses Section */}
        {threadResponses.length > 0 ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-bold" style={{ color: '#1A1A1A' }}>{counts.all} responses</h2>
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value)}
                className="px-3 py-1.5 rounded-lg border text-[12px] outline-none"
                style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}
              >
                <option>Top rated</option>
                <option>Most recent</option>
              </select>
            </div>

            <div className="space-y-3">
              {sorted.map(r => (
                <ResponseCard key={r.id} r={r} onUpvote={() => setRefreshKey(k => k + 1)} questionOwnerId={question.user?.id} questionId={question.id} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border p-12 text-center" style={{ borderColor: '#DEDEDE' }}>
            <p className="text-[14px]" style={{ color: '#5F5E5A' }}>No responses yet. Be the first to help this person!</p>
            {isAuthenticated && currentUser?.id !== question.user?.id && (
              <button
                onClick={() => setShowResponseModal(true)}
                className="mt-4 px-4 py-2 rounded-lg text-[13px] font-medium text-white"
                style={{ backgroundColor: '#2C2C6E' }}
              >
                Share your experience
              </button>
            )}
          </div>
        )}
      </div>

      {showResponseModal && (
        <SubmitResponseModal
          questionId={question.id}
          onClose={() => setShowResponseModal(false)}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
    </div>
  );
}
