import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { Loader2, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { institutions, questions, allTags } from '../data/mockData';
import { toast } from 'sonner';

export default function AskPage() {
  const { isAuthenticated } = useApp();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [institution, setInstitution] = useState('');
  const [institutionSearch, setInstitutionSearch] = useState('');
  const [programme, setProgramme] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [similarLoading, setSimilarLoading] = useState(false);

  const filteredInstitutions = institutionSearch
    ? institutions.filter(i => i.name.toLowerCase().includes(institutionSearch.toLowerCase()) || i.country.toLowerCase().includes(institutionSearch.toLowerCase()))
    : institutions;

  const similarQuestions = title.length >= 10
    ? questions.filter(q => q.title.toLowerCase().split(' ').some(w => w.length > 3 && title.toLowerCase().includes(w))).slice(0, 3)
    : [];

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags(p => [...p, tag]);
    }
    setTagInput('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));
    toast.success('Question posted — we\'ve notified relevant advisors.');
    navigate('/questions/1');
  };

  const canSubmit = title.trim() && institution && tags.length >= 1;

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-[15px]" style={{ color: '#5F5E5A' }}>You need to be logged in to ask a question.</p>
        <Link to="/login" className="px-5 py-2.5 rounded-lg font-medium text-white text-[13px]" style={{ backgroundColor: '#2C2C6E' }}>Log in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="mb-6" style={{ fontSize: '24px', fontWeight: 500, color: '#1A1A1A' }}>Ask a question</h1>

      <div className="flex gap-6">
        {/* Main form */}
        <form onSubmit={handleSubmit} className="flex-1 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Your question</label>
            <div className="relative">
              <input
                value={title}
                onChange={e => setTitle(e.target.value.slice(0, 120))}
                placeholder="What do you want to know?"
                className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] transition-colors"
                style={{ borderColor: '#DEDEDE' }}
              />
              <span className="absolute right-3 bottom-2 text-[11px]" style={{ color: '#888780' }}>{title.length}/120</span>
            </div>
          </div>

          {/* Body */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Add more detail <span style={{ color: '#888780', fontWeight: 400 }}>(optional)</span></label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              placeholder="Give context — the more detail you provide, the better the responses."
              rows={4}
              className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] transition-colors resize-y"
              style={{ borderColor: '#DEDEDE', minHeight: '80px' }}
            />
          </div>

          {/* Institution */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Which institution is this about?</label>
            {institution ? (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border" style={{ borderColor: '#2C2C6E', backgroundColor: '#EEEDFE' }}>
                <span className="flex-1 text-[13px]" style={{ color: '#2C2C6E' }}>{institution}</span>
                <button type="button" onClick={() => setInstitution('')} className="text-[12px]" style={{ color: '#888780' }}>Change</button>
              </div>
            ) : (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888780' }} />
                <input
                  value={institutionSearch}
                  onChange={e => setInstitutionSearch(e.target.value)}
                  placeholder="Search institutions…"
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]"
                  style={{ borderColor: '#DEDEDE' }}
                />
                {institutionSearch && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto" style={{ borderColor: '#DEDEDE' }}>
                    {filteredInstitutions.map(inst => (
                      <button
                        key={inst.id}
                        type="button"
                        onClick={() => { setInstitution(inst.name); setInstitutionSearch(''); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] hover:bg-gray-50 border-b last:border-0"
                        style={{ borderColor: '#DEDEDE', color: '#1A1A1A' }}
                      >
                        {inst.name}
                        <span className="ml-2 text-[12px]" style={{ color: '#888780' }}>{inst.country}</span>
                      </button>
                    ))}
                    {filteredInstitutions.length === 0 && (
                      <div className="px-4 py-3 text-[13px]" style={{ color: '#888780' }}>No matching institutions</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Programme */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
              Which programme? <span style={{ color: '#888780', fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              value={programme}
              onChange={e => setProgramme(e.target.value)}
              placeholder="e.g. BSc Computer Science"
              className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E]"
              style={{ borderColor: '#DEDEDE' }}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>
              Add topic tags
              <span className="ml-2 font-normal" style={{ color: '#888780' }}>({tags.length}/8 — minimum 1)</span>
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map(t => <TagPill key={t} label={t} removable onRemove={() => setTags(p => p.filter(x => x !== t))} />)}
              </div>
            )}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag(tagInput))}
              placeholder="Type a tag and press Enter…"
              disabled={tags.length >= 8}
              className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] disabled:opacity-40"
              style={{ borderColor: '#DEDEDE' }}
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {allTags.filter(t => !tags.includes(t.name)).slice(0, 8).map(t => (
                <button key={t.id} type="button" onClick={() => addTag(t.name)} className="text-[11px] px-2 py-0.5 rounded-full border hover:bg-[#EEEDFE] transition-colors" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
                  + {t.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="flex-1 py-3 rounded-lg text-[14px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: '#2C2C6E' }}
            >
              {submitting && <Loader2 size={15} className="animate-spin" />}
              Post question
            </button>
            <Link to="/dashboard" className="text-[13px] hover:underline" style={{ color: '#888780' }}>Cancel</Link>
          </div>
        </form>

        {/* Similar questions panel */}
        <div className="hidden lg:block w-72 flex-shrink-0">
          <div className="sticky top-20 bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
            <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Similar questions already asked</h3>
            {title.length < 10 ? (
              <p className="text-[12px]" style={{ color: '#888780' }}>Start typing your question to see similar ones…</p>
            ) : similarQuestions.length > 0 ? (
              <>
                <p className="text-[12px] mb-3" style={{ color: '#5F5E5A' }}>These questions were already answered — they might have what you need.</p>
                <div className="space-y-3">
                  {similarQuestions.map(q => (
                    <a key={q.id} href={`/questions/${q.id}`} target="_blank" rel="noreferrer" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors" style={{ border: '1px solid #DEDEDE' }}>
                      <p className="text-[13px] mb-1" style={{ color: '#1A1A1A' }}>{q.title}</p>
                      <div className="flex items-center gap-2">
                        <TagPill label={q.institutionName} size="default" />
                        <span className="text-[12px]" style={{ color: '#888780' }}>{q.responseCount} responses</span>
                      </div>
                    </a>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-[12px]" style={{ color: '#5F5E5A' }}>No similar questions found. Yours will be the first!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
