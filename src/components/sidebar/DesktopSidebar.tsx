'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import useRoutes from '@/app/hooks/useRoutes';
import DesktopSidebarItem from './DesktopSidebarItem';
import Avatar from '@/components/chat/Avatar';
import SettingsModal from './SettingsModal';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface DesktopSidebarProps {
  currentUser: User;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const { routes, isVideoChat, isAttendance } = useRoutes();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Organize routes by position
  const topRoutes = routes.filter(route => route.position === 'top');
  const middleRoutes = routes.filter(route => route.position === 'middle');
  const bottomRoutes = routes.filter(route => route.position === 'bottom');

  // Get section name for the header
  const getSectionName = () => {
    if (isVideoChat) return 'Video Chat';
    if (isAttendance) return 'Attendance';
    return 'Navigation';
  };

  return (
    <>
      <SettingsModal
        currentUser={currentUser}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
      <motion.div 
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:overflow-y-auto lg:border-r lg:border-border/30 lg:pb-4 lg:flex lg:flex-col justify-between transition-all duration-300 ease-in-out"
        initial={{ width: '5rem' }}
        animate={{ width: isExpanded ? '16rem' : '5rem' }}
        style={{ 
          background: isDark 
            ? "linear-gradient(180deg, rgba(15, 23, 42, 0.95) 0%, rgba(20, 30, 50, 0.98) 100%)" 
            : "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 247, 250, 0.98) 100%)",
          backdropFilter: "blur(8px)",
          boxShadow: isDark 
            ? "0 4px 20px rgba(0, 0, 0, 0.25)" 
            : "0 4px 20px rgba(0, 0, 0, 0.05)"
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo or app name */}
        <div className="flex items-center justify-center mt-6 mb-8">
          <motion.div 
            className={`flex items-center justify-center rounded-full p-2 ${isExpanded ? 'w-48 px-4' : 'w-12'}`}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <div className="glass-card text-foreground font-bold text-xl px-6 py-2 rounded-xl">
                Your App
              </div>
            ) : (
              <div className="glass-card text-foreground font-bold text-lg w-10 h-10 flex items-center justify-center rounded-full">
                YA
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation sections */}
        <div className="flex flex-col justify-between h-full">
          <nav className="flex flex-col gap-2 px-2">
            {/* Top routes */}
            <ul role="list" className="flex flex-col items-center space-y-2 mb-6">
              {topRoutes.map((route) => (
                <DesktopSidebarItem
                  key={route.label}
                  href={route.href}
                  label={route.label}
                  icon={route.icon}
                  active={route.active}
                  onClick={route.onClick}
                  isPrimary={route.isPrimary}
                  isExpanded={isExpanded}
                />
              ))}
            </ul>

            {/* Section label */}
            {isExpanded && middleRoutes.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-3">
                  {getSectionName()}
                </p>
              </div>
            )}

            {/* Middle routes - main navigation */}
            <ul role="list" className="flex flex-col items-center space-y-2">
              {middleRoutes.map((route) => (
                <DesktopSidebarItem
                  key={route.label}
                  href={route.href}
                  label={route.label}
                  icon={route.icon}
                  active={route.active}
                  onClick={route.onClick}
                  isExpanded={isExpanded}
                />
              ))}
            </ul>
          </nav>

          {/* Bottom section with divider - user controls */}
          <div className="mt-auto flex flex-col pt-4 border-t border-border/30">
            {/* Controls section - Theme toggle & bottom routes */}
            <div className={`flex flex-col ${isExpanded ? 'justify-between px-3' : 'justify-center'} items-center mb-4`}>
              {/* Theme toggle with consistent styling */}
              <div className={`${isExpanded ? 'mr-2' : ''}  m-4`}>
                <ModeToggle isExpanded={isExpanded} />
              </div>
              
              {/* Bottom routes (like logout) with consistent styling */}
              <div className={`flex ${isExpanded ? 'space-x-2' : 'flex-col space-y-2'}`}>
                {bottomRoutes.map((route) => (
                  <div key={route.label}>
                    <DesktopSidebarItem
                      href={route.href}
                      label={route.label}
                      icon={route.icon}
                      active={route.active}
                      onClick={route.onClick}
                      isExpanded={isExpanded}
                      compact={true}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            {/* User profile - Consistently styled for both states */}
            <div
              onClick={() => setIsOpen(true)}
              className={`
                cursor-pointer hover:bg-secondary/70 transition rounded-xl p-3 mx-2 mb-4
                ${isExpanded ? 'flex items-center space-x-3' : 'flex justify-center'}
                glass-card
              `}
              title="Edit profile"
            >
              <div className="relative">
                <Avatar user={currentUser} />
                <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-background"></span>
              </div>
              
              {isExpanded && (
                <div className="overflow-hidden flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{currentUser.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default DesktopSidebar;