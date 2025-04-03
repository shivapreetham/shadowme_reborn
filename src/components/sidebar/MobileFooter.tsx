'use client';

import useConversation from '@/app/hooks/useConversation';
import useRoutes from '@/app/hooks/useRoutes';
import MobileFooterItem from './MobileFooterItem';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';

const MobileFooter = ({currentUser}) => {
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

      <div
        onClick={() => setIsOpen(true)}
                    className="cursor-pointer hover:bg-secondary/70 transition rounded-xl p-3 mx-2 mb-4 flex justify-center glass-card"
                    title="Edit profile"
                  >
                    <div className="relative">
                      <Avatar user={currentUser} />
                      {/* <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-background"></span> */}
                    </div>
    </div>
  );
};

export default MobileFooter;