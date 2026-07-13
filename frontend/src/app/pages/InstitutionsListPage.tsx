import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Building2, Users, MessageSquare } from 'lucide-react';
import { publicApi } from '../api';
import { EmptyState } from '../components/shared/EmptyState (1)';

interface Institution {
  id: string;
  name: string;
  country: string;
  website?: string;
  _count?: { questions: number; advisors: number };
}

export default function InstitutionsListPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicApi.getInstitutions({ take: 200 })
      .then(res => setInstitutions(res.data.data.institutions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = institutions.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.country.toLowerCase().includes(search.toLowerCase())
  );

  const grouped = filtered.reduce<Record<string, Institution[]>>((acc, inst) => {
    const key = inst.country;
    if (!acc[key]) acc[key] = [];
    acc[key].push(inst);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold mb-1" style={{ color: '#1A1A1A' }}>Institutions</h1>
        <p className="text-[13px]" style={{ color: '#5F5E5A' }}>Browse institutions and see the questions and advisors for each.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#888780' }} />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or country…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-[13px] outline-none focus:border-[#2C2C6E] transition-colors"
          style={{ borderColor: '#DEDEDE', backgroundColor: '#fff' }}
        />
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border animate-pulse" style={{ backgroundColor: '#F7F7FA', borderColor: '#DEDEDE' }} />
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <EmptyState
          icon={<Building2 size={32} style={{ color: '#888780' }} />}
          heading="No institutions found"
          message={search ? 'Try a different search term.' : 'No institutions have been added yet.'}
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([country, insts]) => (
            <div key={country}>
              <h2 className="text-[13px] font-semibold uppercase tracking-wide mb-3" style={{ color: '#888780' }}>
                {country}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {insts.map(inst => (
                  <Link
                    key={inst.id}
                    to={`/institutions/${inst.id}`}
                    className="block p-4 bg-white rounded-xl border hover:border-[#2C2C6E]/40 hover:shadow-sm transition-all"
                    style={{ borderColor: '#DEDEDE' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#EEEDFE' }}>
                        <Building2 size={16} style={{ color: '#2C2C6E' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-medium truncate" style={{ color: '#1A1A1A' }}>{inst.name}</p>
                        <p className="text-[12px]" style={{ color: '#888780' }}>{inst.country}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-[12px]" style={{ color: '#5F5E5A' }}>
                            <MessageSquare size={11} /> {inst._count?.questions ?? 0} questions
                          </span>
                          <span className="flex items-center gap-1 text-[12px]" style={{ color: '#5F5E5A' }}>
                            <Users size={11} /> {inst._count?.advisors ?? 0} advisors
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
