'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface DesktopSidebarItemProps {
  href: string;
  label: string;
  icon: IconType;
  active?: boolean;
  onClick?: () => void;
  isPrimary?: boolean;
  isExpanded: boolean;
  compact?: boolean; // Added for bottom toolbar items
}

const DesktopSidebarItem: React.FC<DesktopSidebarItemProps> = ({
  label,
  icon: Icon,
  href,
  active,
  onClick,
  isPrimary,
  isExpanded,
  compact
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <li onClick={handleClick} title={label} className={clsx("w-full", compact && "list-none")}>
      <Link
        href={href}
        className={clsx(
          'group flex items-center gap-x-3 rounded-md text-sm font-medium transition-all duration-200 w-full',
          // Adjust padding for compact items
          compact ? 'p-2' : isExpanded ? 'p-2.5 justify-start' : 'p-3 justify-center',
          active ? 'bg-black text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100',
          isPrimary && !active ? 'bg-blue-600 text-white hover:bg-blue-700' : '',
          // Add subtle highlight for compact bottom items
          compact && !active && !isPrimary && 'bg-white/70 shadow-sm'
        )}
      >
        <Icon className={clsx(
          'shrink-0',
          isPrimary || active ? 'h-5 w-5' : 'h-5 w-5',
          // Add color for mode toggle icon
          href.includes('theme') && !active && !isPrimary && 'text-indigo-500'
        )} aria-hidden="true" />
        
        {isExpanded && (
          <motion.span 
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="whitespace-nowrap font-medium"
          >
            {label}
          </motion.span>
        )}
      </Link>
    </li>
  );
};

export default DesktopSidebarItem;