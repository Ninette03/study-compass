interface TagPillProps {
  label: string;
  size?: 'default' | 'large';
  interactive?: boolean;
  removable?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
}

export function TagPill({ label, size = 'default', interactive, removable, onRemove, onClick, active }: TagPillProps) {
  const textSize = size === 'large' ? 'text-[13px]' : 'text-[12px]';
  const base = `inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-normal select-none ${textSize}`;
  const colors = active
    ? 'bg-[#2C2C6E] text-white border-[#2C2C6E]'
    : 'bg-[#EEEDFE] text-[#2C2C6E] border-[#2C2C6E]/20';
  const hover = interactive || onClick ? 'cursor-pointer hover:border-[#2C2C6E]/50 transition-colors' : '';

  return (
    <span className={`${base} ${colors} ${hover}`} onClick={onClick} style={{ borderWidth: '0.5px' }}>
      {label}
      {removable && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
          className="ml-0.5 hover:text-[#D85A30] transition-colors text-xs leading-none"
          aria-label={`Remove ${label}`}
        >
          ×
        </button>
      )}
    </span>
  );
}
