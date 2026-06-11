import { useNavigate } from 'react-router';
import { useApp } from '../../context/AppContext';

export function DemoSwitcher() {
  const { currentUser, login, logout } = useApp();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white rounded-xl shadow-lg border p-3 text-[12px]" style={{ borderColor: '#DEDEDE', maxWidth: '220px' }}>
      <p className="font-medium mb-2" style={{ color: '#1A1A1A' }}>Demo mode</p>
      <p className="mb-2" style={{ color: '#888780' }}>
        {currentUser ? `Logged in as: ${currentUser.role}` : 'Not logged in'}
      </p>
      <div className="flex flex-col gap-1.5">
        <button onClick={() => { login('student'); navigate('/dashboard'); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EEEDFE] transition-colors" style={{ color: currentUser?.role === 'student' ? '#2C2C6E' : '#5F5E5A', fontWeight: currentUser?.role === 'student' ? 600 : 400, backgroundColor: currentUser?.role === 'student' ? '#EEEDFE' : undefined }}>
          👤 Student dashboard
        </button>
        <button onClick={() => { login('advisor'); navigate('/dashboard'); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EEEDFE] transition-colors" style={{ color: currentUser?.role === 'advisor' ? '#2C2C6E' : '#5F5E5A', fontWeight: currentUser?.role === 'advisor' ? 600 : 400, backgroundColor: currentUser?.role === 'advisor' ? '#EEEDFE' : undefined }}>
          ⭐ Advisor dashboard
        </button>
        <button onClick={() => { login('admin'); navigate('/admin'); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#EEEDFE] transition-colors" style={{ color: currentUser?.role === 'admin' ? '#2C2C6E' : '#5F5E5A', fontWeight: currentUser?.role === 'admin' ? 600 : 400, backgroundColor: currentUser?.role === 'admin' ? '#EEEDFE' : undefined }}>
          🛡️ Admin panel
        </button>
        {currentUser && (
          <button onClick={() => { logout(); navigate('/'); }} className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-[#FAECE7] transition-colors" style={{ color: '#D85A30' }}>
            ← Log out
          </button>
        )}
      </div>
    </div>
  );
}
