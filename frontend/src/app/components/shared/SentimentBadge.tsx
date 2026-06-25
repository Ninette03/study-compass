import type { SentimentType } from '../../types';

interface SentimentBadgeProps {
  sentiment: SentimentType;
  size?: 'sm' | 'default';
}

const config: Record<SentimentType, { bg: string; text: string; label: string }> = {
  positive: { bg: '#E1F5EE', text: '#0F6E56', label: '● Positive' },
  neutral:  { bg: '#F1EFE8', text: '#5F5E5A', label: '● Neutral' },
  critical: { bg: '#FAECE7', text: '#D85A30', label: '● Critical' },
  pending:  { bg: '#F1EFE8', text: '#888780', label: 'Classifying…' },
};

export function SentimentBadge({ sentiment, size = 'default' }: SentimentBadgeProps) {
  const { bg, text, label } = config[sentiment];
  const textSize = size === 'sm' ? 'text-[11px]' : 'text-[12px]';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 font-normal whitespace-nowrap ${textSize}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

export function SentimentSummaryLabel({ sentiment }: { sentiment: SentimentType }) {
  const { text, label } = config[sentiment];
  return (
    <span className="text-[12px] font-normal" style={{ color: text }}>
      {sentiment === 'positive' ? '● mostly positive' :
       sentiment === 'critical' ? '● mostly critical' :
       sentiment === 'neutral' ? '● mixed' : label}
    </span>
  );
}
