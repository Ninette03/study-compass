import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { TagPill } from '../components/shared/TagPill (1).tsx';
import { SentimentBadge, SentimentSummaryLabel } from '../components/shared/SentimentBadge';
import { AvatarCircle } from '../components/shared/AvatarCircle (1).tsx';
import { EmptyState } from '../components/shared/EmptyState (1).tsx';
import { questions, institutions, allTags, SentimentType } from '../data/mockData';

const PAGE_SIZE = 20;

function QuestionCard({ q }: { q: typeof questions[0] }) {
  return (
    <Link
      to={`/questions/${q.id}`}
      className="block bg-white rounded-lg border p-4 hover:border-[#2C2C6E]/30 transition-colors"
      style={{ borderColor: '#DEDEDE' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-medium mb-1" style={{ color: '#1A1A1A' }}>{q.title}</p>
          <p className="text-[13px] mb-2 line-clamp-2" style={{ color: '#5F5E5A' }}>
            {q.body.slice(0, 100)}{q.body.length > 100 ? '…' : ''}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <TagPill label={q.institutionName} interactive />
            {q.tags.slice(0, 4).map(t => <TagPill key={t} label={t} />)}
            {q.tags.length > 4 && <span className="text-[12px]" style={{ color: '#888780' }}>+{q.tags.length - 4} more</span>}
          </div>
        </div>
        {q.isAnswered && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] flex-shrink-0" style={{ backgroundColor: '#E1F5EE', color: '#0F6E56' }}>
            Answered
          </span>
        )}
      </div>
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <AvatarCircle name={q.askerName} size="sm" />
          <span className="text-[12px]" style={{ color: '#5F5E5A' }}>Asked by {q.askerName} · {q.timeAgo}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px]" style={{ color: '#888780' }}>
            {q.responseCount > 0 ? `${q.responseCount} responses` : 'No responses yet'}
          </span>
          <SentimentSummaryLabel sentiment={q.sentiment} />
        </div>
      </div>
    </Link>
  );
}

export default function BrowseQuestionsPage() {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') ?? '');
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSentiments, setSelectedSentiments] = useState<SentimentType[]>([]);
  const [sortOrder, setSortOrder] = useState('Most recent');
  const [page, setPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const filtered = useMemo(() => {
    let result = [...questions];
    if (search) result = result.filter(q => q.title.toLowerCase().includes(search.toLowerCase()) || q.body.toLowerCase().includes(search.toLowerCase()));
    if (selectedInstitutions.length) result = result.filter(q => selectedInstitutions.includes(q.institutionId));
    if (selectedTags.length) result = result.filter(q => q.tags.some(t => selectedTags.includes(t)));
    if (selectedSentiments.length) result = result.filter(q => selectedSentiments.includes(q.sentiment));
    if (sortOrder === 'Most responses') result.sort((a, b) => b.responseCount - a.responseCount);
    else if (sortOrder === 'Unanswered first') result.sort((a, b) => (a.isAnswered ? 1 : 0) - (b.isAnswered ? 1 : 0));
    return result;
  }, [search, selectedInstitutions, selectedTags, selectedSentiments, sortOrder]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount = selectedInstitutions.length + selectedTags.length + selectedSentiments.length;

  const clearFilters = () => { setSelectedInstitutions([]); setSelectedTags([]); setSelectedSentiments([]); };
  const toggleInstitution = (id: string) => setSelectedInstitutions(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const toggleTag = (t: string) => setSelectedTags(p => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);
  const toggleSentiment = (s: SentimentType) => setSelectedSentiments(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s]);

  const FilterSidebar = () => (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>{activeFilterCount}</span>
          )}
        </h3>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-[12px] hover:underline flex items-center gap-1" style={{ color: '#D85A30' }}>
            <X size={12} /> Clear all
          </button>
        )}
      </div>

      {/* Institution filter */}
      <div>
        <h4 className="text-[13px] font-medium mb-2" style={{ color: '#1A1A1A' }}>Institution</h4>
        <div className="space-y-1.5">
          {institutions.map(inst => (
            <label key={inst.id} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedInstitutions.includes(inst.id)} onChange={() => toggleInstitution(inst.id)} className="rounded" />
              <span className="text-[13px] flex-1" style={{ color: '#5F5E5A' }}>{inst.name}</span>
              <span className="text-[11px]" style={{ color: '#888780' }}>{inst.questions}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Topic tags */}
      <div>
        <h4 className="text-[13px] font-medium mb-2" style={{ color: '#1A1A1A' }}>Topic</h4>
        <div className="flex flex-wrap gap-1.5">
          {allTags.slice(0, 10).map(t => (
            <button key={t.id} onClick={() => toggleTag(t.name)}>
              <TagPill label={t.name} interactive active={selectedTags.includes(t.name)} />
            </button>
          ))}
        </div>
      </div>

      {/* Sentiment filter */}
      <div>
        <h4 className="text-[13px] font-medium mb-2" style={{ color: '#1A1A1A' }}>Sentiment</h4>
        <div className="space-y-1.5">
          {(['positive', 'neutral', 'critical'] as SentimentType[]).map(s => (
            <label key={s} className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={selectedSentiments.includes(s)} onChange={() => toggleSentiment(s)} />
              <span className="text-[13px] capitalize" style={{ color: '#5F5E5A' }}>{s} responses</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-[13px] font-medium mb-2" style={{ color: '#1A1A1A' }}>Sort by</h4>
        <select
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value)}
          className="w-full px-2 py-2 rounded-lg border text-[13px] outline-none"
          style={{ borderColor: '#DEDEDE', color: '#1A1A1A' }}
        >
          {['Most recent', 'Most responses', 'Most upvoted', 'Unanswered first'].map(o => <option key={o}>{o}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="mb-5" style={{ fontSize: '24px', fontWeight: 500, color: '#1A1A1A' }}>Browse questions</h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888780' }} />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by keyword, institution, programme or topic…"
          className="w-full pl-9 pr-4 py-3 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] bg-white"
          style={{ borderColor: '#DEDEDE' }}
        />
      </div>

      <div className="flex gap-6">
        {/* Sidebar — desktop */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border p-4 sticky top-20" style={{ borderColor: '#DEDEDE' }}>
            <FilterSidebar />
          </div>
        </aside>

        {/* Mobile filter toggle */}
        <div className="lg:hidden w-full mb-4">
          <button onClick={() => setMobileFiltersOpen(v => !v)} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px]" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
            <SlidersHorizontal size={14} /> Filters
            {activeFilterCount > 0 && <span className="px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>{activeFilterCount}</span>}
          </button>
          {mobileFiltersOpen && (
            <div className="mt-3 bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
              <FilterSidebar />
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px]" style={{ color: '#5F5E5A' }}>
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} questions
            </span>
          </div>

          {paginated.length === 0 ? (
            <EmptyState
              icon={<Search size={24} />}
              heading="No questions found"
              message="Try adjusting your search or filters to find what you're looking for."
              cta={activeFilterCount > 0 ? <button onClick={clearFilters} className="text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>Clear all filters</button> : undefined}
            />
          ) : (
            <div className="space-y-3">
              {paginated.map(q => <QuestionCard key={q.id} q={q} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border disabled:opacity-40" style={{ borderColor: '#DEDEDE' }}>
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-[13px] border ${p === page ? 'text-white border-[#2C2C6E]' : ''}`} style={{ borderColor: p === page ? '#2C2C6E' : '#DEDEDE', backgroundColor: p === page ? '#2C2C6E' : undefined, color: p === page ? '#fff' : '#5F5E5A' }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border disabled:opacity-40" style={{ borderColor: '#DEDEDE' }}>
                <ChevronRight size={15} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
