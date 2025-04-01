'use client';

import useConversation from '@/app/hooks/useConversation';
import useRoutes from '@/app/hooks/useRoutes';
import MobileFooterItem from './MobileFooterItem';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';

const MobileFooter = () => {
  const { routes } = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) return null;

  // Filter routes to show only the important ones on mobile
  const mobileRoutes = routes.filter(route => 
    route.position === 'middle' || route.isPrimary
  ).slice(0, 4); // Limit to prevent overcrowding

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-background/50 backdrop-blur-xl border-t border-border/30 lg:hidden transition-colors duration-300 px-1 glass-card">
      {mobileRoutes.map((route) => (
        <MobileFooterItem
          key={route.label}
          href={route.href}
          icon={route.icon}
          label={route.label}
          active={route.active}
          onClick={route.onClick}
          isPrimary={route.isPrimary}
        />
      ))}
      <div className="p-3">
        <ModeToggle />
      </div>
    </div>
  );
};

export default MobileFooter;