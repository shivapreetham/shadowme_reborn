// DesktopSidebarItem.tsx
'use client';

import clsx from 'clsx';
import Link from 'next/link';

interface DesktopSidebarItemProps {
  href: string;
  label: string;
  icon: any;
  active?: boolean;
  onClick?: () => void;
}

const DesktopSidebarItem: React.FC<DesktopSidebarItemProps> = ({
  label,
  icon: Icon,
  href,
  active,
  onClick,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <li onClick={handleClick} title={label}>
      <Link
        href={href}
        className={clsx(
          'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold text-muted-foreground transition-colors duration-200',
          'hover:text-foreground hover:bg-secondary',
          active && 'bg-secondary text-foreground'
        )}
      >
        <Icon className="h-6 w-6 shrink-0" aria-hidden="true" />
        <span className="sr-only">{label}</span>
      </Link>
    </li>
  );
};

export default DesktopSidebarItem;
