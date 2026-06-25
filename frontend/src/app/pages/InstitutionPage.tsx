import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { ExternalLink, MessageSquare } from 'lucide-react';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { SentimentSummaryLabel } from '../components/shared/SentimentBadge';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { VerifiedBadge } from '../components/shared/VerifiedBadge';
import { publicApi } from '../api';
import { useApp } from '../context/AppContext';

interface InstitutionData {
  id: string;
  name: string;
  country: string;
  type?: string;
  website?: string;
  _count: { questions: number; advisors: number };
  questions: Array<{
    id: string;
    title: string;
    body: string;
    tags: { name: string }[];
    responses: { id: string; sentiment?: string }[];
  }>;
  advisors: Array<{
    id: string;
    isVerified: boolean;
    programme: string;
    yearOfGraduation?: number;
    user: { id: string; fullName: string; profilePhoto?: string };
  }>;
}

export default function InstitutionPage() {
  const { id } = useParams();
  const { isAuthenticated } = useApp();
  const [institution, setInstitution] = useState<InstitutionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    publicApi.getInstitution(id)
      .then(r => setInstitution(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[14px]" style={{ color: '#888780' }}>Loading…</p></div>;
  if (!institution) return <div className="flex items-center justify-center min-h-[60vh]"><p className="text-[14px]" style={{ color: '#888780' }}>Institution not found.</p></div>;

  const institutionQuestions = institution.questions ?? [];
  const advisors = institution.advisors ?? [];
  const totalResponses = institutionQuestions.reduce((sum, q) => sum + q.responses.length, 0);

  const sentimentCounts = institutionQuestions.flatMap(q => q.responses.map(r => r.sentiment?.toLowerCase()));
  const total = sentimentCounts.length || 1;
  const positiveCount = sentimentCounts.filter(s => s === 'positive').length;
  const neutralCount = sentimentCounts.filter(s => s === 'neutral').length;
  const criticalCount = sentimentCounts.filter(s => s === 'negative' || s === 'critical').length;

  const sentimentData = [
    { label: 'Positive', count: positiveCount, pct: Math.round((positiveCount / total) * 100), color: '#0F6E56', bg: '#E1F5EE' },
    { label: 'Neutral', count: neutralCount, pct: Math.round((neutralCount / total) * 100), color: '#5F5E5A', bg: '#F1EFE8' },
    { label: 'Critical', count: criticalCount, pct: Math.round((criticalCount / total) * 100), color: '#D85A30', bg: '#FAECE7' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="bg-white rounded-xl border p-6 mb-6" style={{ borderColor: '#DEDEDE' }}>
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="mb-1" style={{ fontSize: '24px', fontWeight: 500, color: '#1A1A1A' }}>{institution.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-[13px]" style={{ color: '#5F5E5A' }}>
              <span>{institution.country}</span>
              <span className="capitalize">{institution.type}</span>
              {institution.website && (
                <a href={`https://${institution.website}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: '#2C2C6E' }}>
                  {institution.website} <ExternalLink size={12} />
                </a>
              )}
            </div>
            <div className="flex gap-4 mt-3 text-[13px]" style={{ color: '#5F5E5A' }}>
              <span><strong style={{ color: '#1A1A1A' }}>{institution._count.questions}</strong> questions</span>
              <span><strong style={{ color: '#1A1A1A' }}>{institution._count.advisors}</strong> advisors</span>
              <span><strong style={{ color: '#1A1A1A' }}>{totalResponses}</strong> responses</span>
            </div>
          </div>
          <Link
            to={isAuthenticated ? `/ask?institution=${institution.id}` : '/register'}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium text-white flex-shrink-0"
            style={{ backgroundColor: '#2C2C6E' }}
          >
            <MessageSquare size={14} />
            Ask about {institution.name}
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Questions */}
          <section>
            <h2 className="mb-3" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>
              Questions about {institution.name}
            </h2>
            {institutionQuestions.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#DEDEDE' }}>
                <p className="text-[13px]" style={{ color: '#888780' }}>No questions yet. Be the first to ask!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {institutionQuestions.map(q => (
                  <Link key={q.id} to={`/questions/${q.id}`} className="block bg-white rounded-xl border p-4 hover:border-[#2C2C6E]/30 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                    <p className="text-[14px] font-medium mb-2" style={{ color: '#1A1A1A' }}>{q.title}</p>
                    <p className="text-[13px] mb-2 line-clamp-2" style={{ color: '#5F5E5A' }}>{q.body?.slice(0, 100)}…</p>
                    <div className="flex flex-wrap items-center gap-2">
                      {q.tags.slice(0, 3).map(t => <TagPill key={t.name} label={t.name} />)}
                      <span className="text-[12px]" style={{ color: '#888780' }}>{q.responses.length} responses</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Sentiment overview */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Overall sentiment</h3>
            {sentimentData.map(s => (
              <div key={s.label} className="mb-3">
                <div className="flex items-center justify-between text-[12px] mb-1" style={{ color: '#5F5E5A' }}>
                  <span>{s.label}</span><span>{s.pct}%</span>
                </div>
                <div className="h-2.5 rounded-full" style={{ backgroundColor: '#F7F7FA' }}>
                  <div className="h-2.5 rounded-full" style={{ width: `${s.pct}%`, backgroundColor: s.color }} />
                </div>
              </div>
            ))}
            <p className="text-[11px] mt-2" style={{ color: '#888780' }}>Based on {institutionQuestions.length} questions</p>
          </div>

          {/* Verified advisors */}
          <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Verified advisors</h3>
            {advisors.length === 0 ? (
              <p className="text-[13px]" style={{ color: '#888780' }}>No verified advisors yet for this institution.</p>
            ) : (
              <div className="space-y-3">
                {advisors.map(a => (
                  <Link key={a.id} to={`/profile/${a.user.id}`} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
                    <AvatarCircle name={a.user.fullName} size="sm" />
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: '#1A1A1A' }}>{a.user.fullName}</p>
                      <p className="text-[11px] truncate" style={{ color: '#5F5E5A' }}>{a.programme} · {a.yearOfGraduation ?? 'current'}</p>
                    </div>
                    {a.isVerified && <VerifiedBadge type="alumnus" />}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
