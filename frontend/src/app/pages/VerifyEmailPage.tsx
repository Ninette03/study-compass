import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle, XCircle, Loader2, BookOpen } from 'lucide-react';
import { authApi } from '../api';

type State = 'loading' | 'success' | 'error';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<State>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setErrorMessage('No verification token found in the link. Please check your email and try again.');
      setState('error');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        setErrorMessage(
          err?.response?.data?.error?.message ?? 'This link is invalid or has already been used.'
        );
        setState('error');
      });
  }, [searchParams]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#F7F7FA' }}
    >
      <Link to="/" className="flex items-center gap-2 mb-8">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#2C2C6E' }}
        >
          <BookOpen size={14} className="text-white" />
        </div>
        <span className="font-medium text-[16px]" style={{ color: '#2C2C6E' }}>
          PeerGuide
        </span>
      </Link>

      <div
        className="w-full max-w-[440px] bg-white rounded-xl border p-8 text-center"
        style={{ borderColor: '#DEDEDE' }}
      >
        {state === 'loading' && (
          <>
            <Loader2 size={36} className="animate-spin mx-auto mb-4" style={{ color: '#2C2C6E' }} />
            <p className="text-[14px]" style={{ color: '#5F5E5A' }}>
              Verifying your email…
            </p>
          </>
        )}

        {state === 'success' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#E1F5EE' }}
            >
              <CheckCircle size={28} style={{ color: '#0F6E56' }} />
            </div>
            <h2 className="mb-2" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>
              Email verified!
            </h2>
            <p className="text-[13px] mb-6" style={{ color: '#5F5E5A' }}>
              Your account is now active. You can log in and start using PeerGuide.
            </p>
            <Link
              to="/login"
              className="inline-block w-full py-2.5 rounded-lg text-[14px] font-medium text-white"
              style={{ backgroundColor: '#2C2C6E' }}
            >
              Go to login
            </Link>
          </>
        )}

        {state === 'error' && (
          <>
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#FEE2E2' }}
            >
              <XCircle size={28} style={{ color: '#DC2626' }} />
            </div>
            <h2 className="mb-2" style={{ fontSize: '20px', fontWeight: 500, color: '#1A1A1A' }}>
              Verification failed
            </h2>
            <p className="text-[13px] mb-6" style={{ color: '#5F5E5A' }}>
              {errorMessage}
            </p>
            <Link
              to="/register"
              className="inline-block w-full py-2.5 rounded-lg text-[14px] font-medium text-white"
              style={{ backgroundColor: '#2C2C6E' }}
            >
              Back to register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
