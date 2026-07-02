function nameToColor(name: string): string {
  const colors = [
    '#4F46E5', '#7C3AED', '#DB2777', '#DC2626', '#D97706',
    '#059669', '#0891B2', '#2C2C6E', '#6D28D9', '#065F46',
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

interface AvatarCircleProps {
  name: string;
  size?: 'nav' | 'card' | 'profile' | 'sm';
  photo?: string | null;
}

export function AvatarCircle({ name = '', size = 'card', photo }: AvatarCircleProps) {
  const dims = { nav: 'w-[30px] h-[30px] text-[11px]', sm: 'w-7 h-7 text-[10px]', card: 'w-9 h-9 text-[13px]', profile: 'w-[60px] h-[60px] text-[20px]' };
  const cls = dims[size] ?? dims.card;

  if (photo) {
    return <img src={photo} alt={name} className={`${cls} rounded-full object-cover flex-shrink-0`} />;
  }

  return (
    <span
      className={`${cls} rounded-full flex items-center justify-center font-medium text-white flex-shrink-0`}
      style={{ backgroundColor: nameToColor(name) }}
      aria-label={name}
    >
      {getInitials(name)}
    </span>
  );
}
