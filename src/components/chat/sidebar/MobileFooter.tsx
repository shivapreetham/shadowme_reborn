
// MobileFooter.tsx
'use client';

import useConversation from '@/app/hooks/useConversation';
import useRoutes from '@/app/hooks/useRoutes';
import MobileFooterItem from './MobileFooterItem';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';

const MobileFooter = () => {
  const routes = useRoutes();
  const { isOpen } = useConversation();

  if (isOpen) return null;

  return (
    <div className="fixed justify-between w-full bottom-0 z-40 flex items-center bg-background/50 backdrop-blur-sm border-t border-border lg:hidden transition-colors duration-300">
      {routes.map((route) => (
        <MobileFooterItem
          key={route.label}
          href={route.href}
          icon={route.icon}
          active={route.active}
          onClick={route.onClick}
        />
      ))}
      <div className="p-4">
        <ModeToggle />
      </div>
    </div>
  );
};

export default MobileFooter;
