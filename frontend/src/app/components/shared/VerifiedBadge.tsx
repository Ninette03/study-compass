import { CheckCircle } from 'lucide-react';

interface VerifiedBadgeProps {
  type?: 'alumnus' | 'student' | 'unverified';
}

export function VerifiedBadge({ type = 'alumnus' }: VerifiedBadgeProps) {
  if (type === 'unverified') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#888780' }}>
        <span className="w-3 h-3 rounded-full border border-current inline-block opacity-50" />
        Unverified
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: '#0F6E56' }}>
      <CheckCircle size={12} className="flex-shrink-0" />
      {type === 'alumnus' ? 'Verified alumnus' : 'Verified student'}
    </span>
  );
}
