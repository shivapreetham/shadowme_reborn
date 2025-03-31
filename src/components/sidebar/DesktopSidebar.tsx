'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import useRoutes from '@/app/hooks/useRoutes';
import DesktopSidebarItem from './DesktopSidebarItem';
import Avatar from '@/components/chat/Avatar';
import SettingsModal from './SettingsModal';
import { ModeToggle } from '@/components/home&anonymous/ModeToggle';
import { motion } from 'framer-motion';

interface DesktopSidebarProps {
  currentUser: User;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ currentUser }) => {
  const { routes, isVideoChat, isAttendance } = useRoutes();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

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
        className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:overflow-y-auto lg:border-r lg:border-gray-200 lg:pb-4 lg:flex lg:flex-col justify-between transition-all duration-300 ease-in-out"
        initial={{ width: '5rem' }}
        animate={{ width: isExpanded ? '16rem' : '5rem' }}
        style={{ 
          background: "linear-gradient(180deg, #f5f7fa 0%, #f0f2f5 100%)",
          boxShadow: "0 2px 12px rgba(0, 0, 0, 0.05)"
        }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo or app name */}
        <div className="flex items-center justify-center mt-4 mb-6">
          <motion.div 
            className={`flex items-center justify-center rounded-xl p-2 ${isExpanded ? 'w-48 px-4' : 'w-12'}`}
            transition={{ duration: 0.2 }}
          >
            {isExpanded ? (
              <div className="text-gray-800 font-bold text-xl bg-white px-6 py-2 rounded-md shadow-sm">
                Your App
              </div>
            ) : (
              <div className="bg-white text-gray-800 font-bold text-lg w-10 h-10 flex items-center justify-center rounded-md shadow-sm">
                YA
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation sections */}
        <div className="flex flex-col justify-between h-full">
          <nav className="flex flex-col gap-1 px-2">
            {/* Top routes */}
            <ul role="list" className="flex flex-col items-center space-y-1 mb-6">
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
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-3">
                  {getSectionName()}
                </p>
              </div>
            )}

            {/* Middle routes - main navigation */}
            <ul role="list" className="flex flex-col items-center space-y-1">
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
          <div className="mt-auto flex flex-col items-center space-y-3 pt-4 border-t border-gray-200">
            <div className={`flex ${isExpanded ? 'justify-between w-full px-2' : 'justify-center'} items-center`}>
              <div className="p-2">
                <ModeToggle />
              </div>
              
              {bottomRoutes.map((route) => (
                <div key={route.label} className="p-1">
                  <DesktopSidebarItem
                    href={route.href}
                    label={route.label}
                    icon={route.icon}
                    active={route.active}
                    onClick={route.onClick}
                    isExpanded={isExpanded}
                  />
                </div>
              ))}
            </div>
            
            {/* User profile */}
            <div
              onClick={() => setIsOpen(true)}
              className="cursor-pointer hover:bg-gray-100 transition rounded-lg p-2 m-2 w-full flex items-center justify-center"
              title="Edit profile"
            >
              {isExpanded ? (
                <div className="flex items-center space-x-3 w-full px-1">
                  <div className="relative">
                    <Avatar user={currentUser} />
                    <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-white"></span>
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-medium text-gray-700 truncate">{currentUser.username}</p>
                    <p className="text-xs text-gray-500 truncate">{currentUser.email}</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <Avatar user={currentUser} />
                  <span className="absolute bottom-0 right-0 block h-2 w-2 rounded-full bg-green-400 ring-1 ring-white"></span>
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