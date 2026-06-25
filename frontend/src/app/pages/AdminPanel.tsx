import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Shield, CheckCircle, Trash2, EyeOff, Eye, Plus, Merge, Users, Tag, Building2, Flag, LayoutDashboard } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { adminApi, moderationApi, profileApi } from '../api';
import { toast } from 'sonner';

type Tab = 'overview' | 'verifications' | 'flagged' | 'institutions' | 'tags' | 'users';

const NAV_ITEMS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'verifications', label: 'Verifications', icon: <CheckCircle size={16} /> },
  { id: 'flagged', label: 'Flagged responses', icon: <Flag size={16} /> },
  { id: 'institutions', label: 'Institutions', icon: <Building2 size={16} /> },
  { id: 'tags', label: 'Tags', icon: <Tag size={16} /> },
  { id: 'users', label: 'Users', icon: <Users size={16} /> },
];

export default function AdminPanel() {
  const { isAuthenticated, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [verifications, setVerifications] = useState<any[]>([]);
  const [flags, setFlags] = useState<any[]>([]);
  const [institutions, setInstitutions] = useState<any[]>([]);
  const [allTags, setAllTags] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState({ pendingVerifications: 0, flaggedResponses: 0, totalUsers: 0, questionsToday: 0 });

  useEffect(() => {
    if (!isAuthenticated || currentUser?.role !== 'admin') return;
    adminApi.getStats().then(r => setAdminStats(r.data.data)).catch(() => {});
    profileApi.getVerificationQueue().then(r => setVerifications(r.data.data.verifications ?? [])).catch(() => {});
    moderationApi.getFlags().then(r => setFlags(r.data.data.flags ?? [])).catch(() => {});
    adminApi.getInstitutions().then(r => setInstitutions(r.data.data.institutions ?? [])).catch(() => {});
    adminApi.getTags().then(r => setAllTags(r.data.data.tags ?? [])).catch(() => {});
    adminApi.getUsers().then(r => setUsers(r.data.data.users ?? [])).catch(() => {});
  }, [isAuthenticated, currentUser?.role]);

  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Shield size={40} style={{ color: '#D85A30' }} />
        <p className="text-[15px]" style={{ color: '#5F5E5A' }}>This page requires admin access.</p>
        <Link to="/" className="text-[13px] hover:underline" style={{ color: '#2C2C6E' }}>Go home</Link>
      </div>
    );
  }

  const approveVerification = (id: string) => {
    profileApi.approveVerification(id).catch(() => {});
    setVerifications(p => p.filter(v => v.id !== id));
    toast.success('Advisor verified. Approval email sent.');
  };
  const rejectVerification = (id: string) => {
    profileApi.rejectVerification(id).catch(() => {});
    setVerifications(p => p.filter(v => v.id !== id));
    toast.error('Verification rejected. Email sent to user.');
  };
  const keepResponse = (id: string) => {
    moderationApi.resolveFlag(id).catch(() => {});
    setFlags(p => p.filter(f => f.id !== id));
    toast.success('Flags cleared. Response is visible.');
  };
  const hideResponse = (id: string) => {
    const flag = flags.find(f => f.id === id);
    if (flag?.responseId) moderationApi.hideResponse(flag.responseId).catch(() => {});
    setFlags(p => p.filter(f => f.id !== id));
    toast.success('Response hidden from public view.');
  };

  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 bg-white border-r" style={{ borderColor: '#DEDEDE' }}>
        <div className="p-4 border-b" style={{ borderColor: '#DEDEDE' }}>
          <p className="text-[13px] font-medium" style={{ color: '#1A1A1A' }}>Admin Panel</p>
          <p className="text-[12px]" style={{ color: '#888780' }}>PeerGuide Platform</p>
        </div>
        <nav className="p-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] mb-0.5 transition-colors text-left`}
              style={{
                backgroundColor: activeTab === item.id ? '#EEEDFE' : undefined,
                color: activeTab === item.id ? '#2C2C6E' : '#5F5E5A',
                fontWeight: activeTab === item.id ? 500 : 400,
              }}
            >
              {item.icon} {item.label}
              {item.id === 'verifications' && verifications.length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: '#D85A30' }}>{verifications.length}</span>
              )}
              {item.id === 'flagged' && flags.length > 0 && (
                <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium text-white" style={{ backgroundColor: '#D85A30' }}>{flags.length}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="mb-6" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Overview</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Pending verifications', value: adminStats.pendingVerifications, color: '#D85A30', bg: '#FAECE7' },
                { label: 'Flagged responses', value: adminStats.flaggedResponses, color: '#B45309', bg: '#FEF3C7' },
                { label: 'Total users', value: adminStats.totalUsers.toLocaleString(), color: '#2C2C6E', bg: '#EEEDFE' },
                { label: 'Questions today', value: adminStats.questionsToday, color: '#0F6E56', bg: '#E1F5EE' },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
                  <div className="text-[24px] font-medium mb-1" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-[12px]" style={{ color: '#5F5E5A' }}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
                <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Pending verifications</h3>
                    {verifications.slice(0, 3).map(v => (
                      <div key={v.id} className="flex items-center justify-between py-2 border-b last:border-0 text-[13px]" style={{ borderColor: '#DEDEDE' }}>
                        <span style={{ color: '#1A1A1A' }}>{v.user?.fullName ?? v.id}</span>
                        <span style={{ color: '#888780' }}>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</span>
                      </div>
                    ))}
                <button onClick={() => setActiveTab('verifications')} className="mt-2 text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>View all →</button>
              </div>
              <div className="bg-white rounded-xl border p-4" style={{ borderColor: '#DEDEDE' }}>
                <h3 className="text-[14px] font-medium mb-3" style={{ color: '#1A1A1A' }}>Flagged responses</h3>
                {flags.slice(0, 3).map(f => (
                  <div key={f.id} className="py-2 border-b last:border-0" style={{ borderColor: '#DEDEDE' }}>
                    <p className="text-[13px] truncate mb-1" style={{ color: '#1A1A1A' }}>{f.response?.body?.slice(0, 60) ?? f.id}…</p>
                    <div className="flex gap-1">
                      <span className="text-[11px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: '#FAECE7', color: '#D85A30' }}>{f.reason}</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setActiveTab('flagged')} className="mt-2 text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>Review all →</button>
              </div>
            </div>
          </div>
        )}

        {/* Verifications */}
        {activeTab === 'verifications' && (
          <div>
            <h1 className="mb-6" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Verifications</h1>
            {verifications.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#DEDEDE' }}>
                <CheckCircle size={32} className="mx-auto mb-3" style={{ color: '#0F6E56' }} />
                <p className="text-[14px] font-medium mb-1" style={{ color: '#1A1A1A' }}>All caught up!</p>
                <p className="text-[13px]" style={{ color: '#5F5E5A' }}>No pending verification requests.</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: '#DEDEDE', backgroundColor: '#F7F7FA' }}>
                      {['Name', 'Institution', 'Programme', 'Submitted', 'Document', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[12px] font-medium" style={{ color: '#5F5E5A' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {verifications.map(v => (
                      <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors" style={{ borderColor: '#DEDEDE' }}>
                        <td className="px-4 py-3 text-[13px] font-medium" style={{ color: '#1A1A1A' }}>{v.user?.fullName ?? v.userId}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{v.institutions?.[0]?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{v.programme}</td>
                        <td className="px-4 py-3 text-[12px]" style={{ color: '#888780' }}>{v.createdAt ? new Date(v.createdAt).toLocaleDateString() : ''}</td>
                        <td className="px-4 py-3">
                          {v.idVerificationUrl && <a href={v.idVerificationUrl} target="_blank" rel="noreferrer" className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>View document</a>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button onClick={() => approveVerification(v.userId)} className="px-3 py-1 rounded-lg border text-[12px] font-medium transition-colors hover:bg-[#E1F5EE]" style={{ borderColor: '#0F6E56', color: '#0F6E56' }}>Approve</button>
                            <button onClick={() => rejectVerification(v.userId)} className="px-3 py-1 rounded-lg border text-[12px] font-medium transition-colors hover:bg-[#FAECE7]" style={{ borderColor: '#D85A30', color: '#D85A30' }}>Reject</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Flagged responses */}
        {activeTab === 'flagged' && (
          <div>
            <h1 className="mb-6" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Flagged responses</h1>
            {flags.length === 0 ? (
              <div className="bg-white rounded-xl border p-8 text-center" style={{ borderColor: '#DEDEDE' }}>
                <Flag size={32} className="mx-auto mb-3" style={{ color: '#0F6E56' }} />
                <p className="text-[14px] font-medium" style={{ color: '#1A1A1A' }}>No flagged responses to review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map(f => (
                  <div key={f.id} className="bg-white rounded-xl border p-5" style={{ borderColor: '#DEDEDE' }}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                    <p className="text-[12px] mb-1" style={{ color: '#888780' }}>On: "{f.response?.question?.title ?? 'a question'}"</p>
                    <p className="text-[13px]" style={{ color: '#1A1A1A' }}>{f.response?.body?.slice(0, 120) ?? f.id}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium flex-shrink-0" style={{ backgroundColor: '#FAECE7', color: '#D85A30' }}>{f.reason}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px]" style={{ backgroundColor: '#FAECE7', color: '#D85A30' }}>{f.reason}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => keepResponse(f.id)} className="px-3 py-1.5 rounded-lg border text-[12px] transition-colors hover:bg-gray-50" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>Keep response</button>
                      <button onClick={() => hideResponse(f.id)} className="px-3 py-1.5 rounded-lg border text-[12px] transition-colors hover:bg-[#FAECE7]" style={{ borderColor: '#D85A30', color: '#D85A30' }}>
                        <EyeOff size={13} className="inline mr-1" />Hide response
                      </button>
                      <button onClick={() => { setFlags(p => p.filter(x => x.id !== f.id)); moderationApi.resolveFlag(f.id).catch(() => {}); toast.success('Response permanently deleted.'); }} className="px-3 py-1.5 rounded-lg border text-[12px] transition-colors hover:bg-red-50" style={{ borderColor: '#D85A30', color: '#D85A30' }}>
                        <Trash2 size={13} className="inline mr-1" />Delete permanently
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Institutions */}
        {activeTab === 'institutions' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Institutions</h1>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>
                <Plus size={14} /> Add institution
              </button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#DEDEDE', backgroundColor: '#F7F7FA' }}>
                    {['Name', 'Country', 'Questions', 'Advisors', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[12px] font-medium" style={{ color: '#5F5E5A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {institutions.map(inst => (
                    <tr key={inst.id} className="border-b last:border-0 hover:bg-gray-50" style={{ borderColor: '#DEDEDE' }}>
                      <td className="px-4 py-3 text-[13px] font-medium" style={{ color: '#1A1A1A' }}>{inst.name}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{inst.country}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{inst._count?.questions ?? 0}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{inst._count?.advisors ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F1EFE8', color: '#5F5E5A' }}>Unclaimed</span>
                      </td>
                      <td className="px-4 py-3">
                        <button className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tags */}
        {activeTab === 'tags' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Tags</h1>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>
                <Plus size={14} /> Add tag
              </button>
            </div>
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#DEDEDE', backgroundColor: '#F7F7FA' }}>
                    {['Tag name', 'Category', 'Questions', 'Advisors', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[12px] font-medium" style={{ color: '#5F5E5A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTags.map(tag => (
                    <tr key={tag.id} className="border-b last:border-0 hover:bg-gray-50" style={{ borderColor: '#DEDEDE' }}>
                      <td className="px-4 py-3 text-[13px] font-medium" style={{ color: '#1A1A1A' }}>{tag.name}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{tag.category ?? '—'}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>—</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>—</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>Merge</button>
                          <button className="text-[12px] hover:underline" style={{ color: '#D85A30' }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users */}
        {activeTab === 'users' && (
          <div>
            <h1 className="mb-6" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Users</h1>
            <div className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: '#DEDEDE' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ borderColor: '#DEDEDE', backgroundColor: '#F7F7FA' }}>
                    {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[12px] font-medium" style={{ color: '#5F5E5A' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id} className="border-b last:border-0 hover:bg-gray-50" style={{ borderColor: '#DEDEDE' }}>
                      <td className="px-4 py-3 text-[13px] font-medium" style={{ color: '#1A1A1A' }}>{u.fullName}</td>
                      <td className="px-4 py-3 text-[13px]" style={{ color: '#5F5E5A' }}>{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full capitalize" style={{ backgroundColor: u.role === 'ADMIN' ? '#EEEDFE' : u.role === 'ADVISOR' ? '#E1F5EE' : '#F1EFE8', color: u.role === 'ADMIN' ? '#2C2C6E' : u.role === 'ADVISOR' ? '#0F6E56' : '#5F5E5A' }}>{u.role.toLowerCase()}</span>
                      </td>
                      <td className="px-4 py-3 text-[12px]" style={{ color: '#888780' }}>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <Link to={`/profile/${u.id}`} className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
