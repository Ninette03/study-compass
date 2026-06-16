import { useState } from 'react';
import { Link } from 'react-router';
import { BookOpen, Loader2, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F7F7FA' }}>
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2C2C6E' }}>
          <BookOpen size={14} className="text-white" />
        </div>
        <span className="font-medium text-[16px]" style={{ color: '#2C2C6E' }}>PeerGuide</span>
      </Link>

      <div className="w-full max-w-[420px] bg-white rounded-xl border p-8" style={{ borderColor: '#DEDEDE' }}>
        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#E1F5EE' }}>
              <CheckCircle size={24} style={{ color: '#0F6E56' }} />
            </div>
            <h1 className="mb-2" style={{ fontSize: '18px', fontWeight: 500, color: '#1A1A1A' }}>Check your email</h1>
            <p className="text-[13px] mb-6" style={{ color: '#5F5E5A' }}>
              If {email} is registered, a reset link has been sent. The link expires in 30 minutes.
            </p>
            <Link to="/login" className="text-[13px] font-medium hover:underline" style={{ color: '#2C2C6E' }}>
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Reset your password</h1>
            <p className="text-[13px] mb-6" style={{ color: '#5F5E5A' }}>Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Email address</label>
                <input
                  type="email"
                  required
                  autoFocus
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] transition-colors"
                  style={{ borderColor: '#DEDEDE', color: '#1A1A1A' }}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-2.5 rounded-lg text-[14px] font-medium text-white flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ backgroundColor: '#2C2C6E' }}
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
              <Link to="/login" className="block text-center text-[13px] hover:underline" style={{ color: '#5F5E5A' }}>
                Back to login
              </Link>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
