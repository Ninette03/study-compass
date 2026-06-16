import { Link, useNavigate } from 'react-router';
import { ShieldOff } from 'lucide-react';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#FAECE7' }}>
        <ShieldOff size={28} style={{ color: '#D85A30' }} />
      </div>
      <div className="text-[60px] font-medium leading-none mb-3" style={{ color: '#DEDEDE' }}>403</div>
      <h1 className="mb-2" style={{ fontSize: '22px', fontWeight: 500, color: '#1A1A1A' }}>Access denied</h1>
      <p className="text-[14px] mb-8 max-w-xs" style={{ color: '#5F5E5A' }}>
        You do not have permission to view this page.
      </p>
      <button onClick={() => navigate(-1)} className="px-5 py-2.5 rounded-lg border text-[13px] font-medium" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
        Go back
      </button>
    </div>
  );
}
