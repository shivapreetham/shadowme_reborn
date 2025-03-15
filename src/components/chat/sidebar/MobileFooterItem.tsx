
// MobileFooterItem.tsx
'use client';

import clsx from 'clsx';
import Link from 'next/link';

interface MobileFooterItemProps {
  href: string;
  icon: any;
  active?: boolean;
  onClick?: () => void;
}

const MobileFooterItem: React.FC<MobileFooterItemProps> = ({
  icon: Icon,
  href,
  active,
  onClick,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={clsx(
        'group flex gap-x-3 text-sm leading-6 font-semibold w-full justify-center p-4',
        'text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors duration-200',
        active && 'bg-secondary text-foreground'
      )}
    >
      <Icon className="h-6 w-6" aria-hidden="true" />
    </Link>
  );
};

export default MobileFooterItem;