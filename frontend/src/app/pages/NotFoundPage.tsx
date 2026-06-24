import { Link } from 'react-router';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="text-[80px] font-medium leading-none mb-4" style={{ color: '#DEDEDE' }}>404</div>
      <h1 className="mb-2" style={{ fontSize: '22px', fontWeight: 500, color: '#1A1A1A' }}>Page not found</h1>
      <p className="text-[14px] mb-8 max-w-xs" style={{ color: '#5F5E5A' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-3">
        <Link to="/" className="px-5 py-2.5 rounded-lg text-[13px] font-medium text-white" style={{ backgroundColor: '#2C2C6E' }}>
          Go home
        </Link>
        <Link to="/questions" className="px-5 py-2.5 rounded-lg text-[13px] font-medium border" style={{ borderColor: '#DEDEDE', color: '#5F5E5A' }}>
          Browse questions
        </Link>
      </div>
    </div>
  );
}
