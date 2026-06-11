import { ReactNode } from 'react';

interface EmptyStateProps {
  icon?: ReactNode;
  heading: string;
  message: string;
  cta?: ReactNode;
}

export function EmptyState({ icon, heading, message, cta }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {icon && (
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: '#EEEDFE', color: '#2C2C6E' }}>
          {icon}
        </div>
      )}
      <h3 className="text-[15px] font-medium mb-1" style={{ color: '#1A1A1A' }}>{heading}</h3>
      <p className="text-[13px] mb-4 max-w-xs" style={{ color: '#5F5E5A' }}>{message}</p>
      {cta}
    </div>
  );
}
