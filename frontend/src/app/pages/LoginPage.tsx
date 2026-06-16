import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Eye, EyeOff, BookOpen, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    // Demo: any email/password combo works
    if (email.includes('admin')) {
      login('admin');
      navigate('/admin');
    } else if (email.includes('advisor')) {
      login('advisor');
      navigate('/dashboard');
    } else if (email) {
      login('student');
      navigate('/dashboard');
    } else {
      setError('Incorrect email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: '#F7F7FA' }}>
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2C2C6E' }}>
          <BookOpen size={14} className="text-white" />
        </div>
        <span className="font-medium text-[16px]" style={{ color: '#2C2C6E' }}>PeerGuide</span>
      </Link>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-white rounded-xl border p-8" style={{ borderColor: '#DEDEDE' }}>
        <h1 className="mb-6" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>Welcome back</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Email</label>
            <input
              type="email"
              autoFocus
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] transition-colors"
              style={{ borderColor: '#DEDEDE', backgroundColor: '#fff', color: '#1A1A1A' }}
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#1A1A1A' }}>Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 rounded-lg border text-[13px] outline-none focus:border-[#2C2C6E] transition-colors"
                style={{ borderColor: '#DEDEDE', backgroundColor: '#fff', color: '#1A1A1A' }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: '#888780' }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className="flex justify-end mt-1">
              <Link to="/forgot-password" className="text-[12px] hover:underline" style={{ color: '#2C2C6E' }}>Forgot password?</Link>
            </div>
          </div>

          {error && (
            <div className="rounded-lg px-3 py-2.5 text-[13px]" style={{ backgroundColor: '#FAECE7', color: '#D85A30' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full py-2.5 rounded-lg text-[14px] font-medium text-white transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ backgroundColor: '#2C2C6E' }}
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Logging in…' : 'Log in'}
          </button>
        </form>

        <div className="mt-4 p-3 rounded-lg text-[12px]" style={{ backgroundColor: '#EEEDFE', color: '#5F5E5A' }}>
          <strong>Demo:</strong> Enter any email/password. Use "advisor@" for advisor role or "admin@" for admin role.
        </div>
      </div>

      <p className="mt-5 text-[13px]" style={{ color: '#5F5E5A' }}>
        Don't have an account?{' '}
        <Link to="/register" className="hover:underline font-medium" style={{ color: '#2C2C6E' }}>Sign up free</Link>
      </p>
    </div>
  );
}
