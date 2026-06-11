import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShieldCheck, ArrowRight, Star, Zap, CheckCircle } from 'lucide-react';
import { TagPill } from '../components/shared/TagPill';
import { SentimentSummaryLabel } from '../components/shared/SentimentBadge';
import { AvatarCircle } from '../components/shared/AvatarCircle';
import { questions, siteStats } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/questions?q=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="py-20 px-4 text-center" style={{ background: 'linear-gradient(135deg, #2C2C6E 0%, #1e1e52 100%)' }}>
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] mb-6" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff' }}>
            <ShieldCheck size={12} />
            Verified peer responses only
          </div>

          <h1 className="text-white mb-4 leading-tight" style={{ fontSize: '32px', fontWeight: 500 }}>
            Real guidance from students<br />who've been there
          </h1>
          <p className="mb-8 text-white/75" style={{ fontSize: '15px' }}>
            Ask questions about any African university and get honest, verified answers from alumni and current students.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Link
              to={isAuthenticated ? '/ask' : '/register'}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[14px] font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#D85A30' }}
            >
              Ask a question
            </Link>
            <Link
              to="/questions"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[14px] font-medium transition-colors border"
              style={{ backgroundColor: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,0.4)' }}
            >
              Browse questions
            </Link>
          </div>

          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by institution, programme or topic…"
                className="w-full pl-9 pr-4 py-3 rounded-lg text-[13px] outline-none border-0"
                style={{ backgroundColor: '#fff', color: '#1A1A1A' }}
              />
            </div>
            <button type="submit" className="px-5 py-3 rounded-lg text-[13px] font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: '#2C2C6E' }}>
              Search
            </button>
          </form>
          <p className="mt-2 text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Try: University of Rwanda computer science
          </p>
        </div>
      </section>

      {/* Stats row */}
      <section className="bg-white border-b" style={{ borderColor: '#DEDEDE' }}>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: `${(siteStats.verifiedAdvisors / 1000).toFixed(1)}k+`, label: 'Verified advisors' },
              { value: `${siteStats.institutions}`, label: 'Institutions covered' },
              { value: `${(siteStats.questionsAnswered / 1000).toFixed(1)}k+`, label: 'Questions answered' },
              { value: `${siteStats.responseRate}%`, label: 'Questions get a response' },
            ].map((stat, i, arr) => (
              <div key={stat.label} className={`${i < arr.length - 1 ? 'border-r' : ''}`} style={{ borderColor: '#DEDEDE' }}>
                <div className="text-2xl font-medium mb-1" style={{ color: '#2C2C6E' }}>{stat.value}</div>
                <div className="text-[12px]" style={{ color: '#5F5E5A' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-10" style={{ color: '#1A1A1A', fontSize: '22px' }}>How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Ask your question', desc: 'Post a question about any institution, programme, or campus life topic.' },
              { step: '2', title: 'We match advisors', desc: 'Our system notifies verified alumni and current students with relevant experience.' },
              { step: '3', title: 'Get honest answers', desc: 'Read verified, sentiment-labelled responses from people who actually attended.' },
            ].map(item => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-4" style={{ backgroundColor: '#EEEDFE' }}>
                  {item.icon}
                </div>
                <h3 className="mb-2" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>{item.title}</h3>
                <p className="text-[13px]" style={{ color: '#5F5E5A' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature cards */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center mb-10" style={{ color: '#1A1A1A', fontSize: '22px' }}>Why PeerGuide?</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <CheckCircle size={20} style={{ color: '#0F6E56' }} />, title: 'Verified experience', desc: 'Every advisor uploads ID verification. Responses are labelled with their institution, programme, and year.' },
              { icon: <Zap size={20} style={{ color: '#2C2C6E' }} />, title: 'Smart routing', desc: 'Questions are automatically matched to advisors with the most relevant first-hand experience.' },
              { icon: <Star size={20} style={{ color: '#D85A30' }} />, title: 'Sentiment labels', desc: 'ML-powered sentiment classification shows you at a glance how advisors feel about their experience.' },
            ].map(f => (
              <div key={f.title} className="rounded-lg border p-5" style={{ borderColor: '#DEDEDE', backgroundColor: '#fff' }}>
                <div className="mb-3">{f.icon}</div>
                <h3 className="mb-2" style={{ fontSize: '15px', fontWeight: 500, color: '#1A1A1A' }}>{f.title}</h3>
                <p className="text-[13px]" style={{ color: '#5F5E5A' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent questions feed */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ color: '#1A1A1A', fontSize: '18px', fontWeight: 500 }}>Recent questions</h2>
            <Link to="/questions" className="flex items-center gap-1 text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>
              Browse all questions <ArrowRight size={13} />
            </Link>
          </div>
          <div className="space-y-3">
            {questions.slice(0, 5).map(q => (
              <Link
                key={q.id}
                to={`/questions/${q.id}`}
                className="flex items-start gap-3 p-4 bg-white rounded-lg border hover:border-[#2C2C6E]/30 transition-colors group"
                style={{ borderColor: '#DEDEDE' }}
              >
                <AvatarCircle name={q.askerName} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium group-hover:text-[#2C2C6E] transition-colors truncate" style={{ color: '#1A1A1A' }}>
                    {q.title}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <TagPill label={q.institutionName} size="default" />
                    {q.tags.slice(0, 2).map(t => <TagPill key={t} label={t} />)}
                    <span className="text-[12px]" style={{ color: '#888780' }}>{q.responseCount} responses</span>
                    <SentimentSummaryLabel sentiment={q.sentiment} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 px-4 border-t" style={{ borderColor: '#DEDEDE', backgroundColor: '#fff' }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EEEDFE' }}>
              <span className="text-[10px] font-medium" style={{ color: '#2C2C6E' }}>PG</span>
            </div>
            <span className="text-[13px] font-medium" style={{ color: '#2C2C6E' }}>PeerGuide</span>
          </div>
          <div className="flex gap-5">
            {['About', 'Privacy', 'Terms', 'Contact'].map(link => (
              <Link key={link} to="/" className="text-[12px] hover:underline" style={{ color: '#5F5E5A' }}>{link}</Link>
            ))}
          </div>
          <p className="text-[12px]" style={{ color: '#888780' }}>© 2026 PeerGuide. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
