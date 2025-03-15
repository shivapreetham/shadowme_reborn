import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { HiChat } from 'react-icons/hi';
import { signOut } from 'next-auth/react';
import useConversation from './useConversation';
import { HiArrowLeftOnRectangle, HiUsers, HiHome } from 'react-icons/hi2';
const useRoutes = () => {
  const pathname = usePathname();
  const { conversationId } = useConversation();

  const routes = useMemo(
    () => [
      {
        label: 'Chat',
        href: '/conversations',
        icon: HiChat,
        active: pathname === '/conversations' || !!conversationId,
      },
      {
        label: 'Users',
        href: '/users',
        icon: HiUsers,
        active: pathname === '/users',
      },
      {
        label: 'Dashboard',
        href: '/dashboard',
        icon: HiHome,
        active: pathname === '/dashboard',
      },
      {
        label: 'Logout',
        href: '/', 
        onClick: async () => {
          await signOut({ callbackUrl: '/' });
        },
        icon: HiArrowLeftOnRectangle,
      },
    ],
    [pathname, conversationId]
  );

  return routes;
};

export default useRoutes;
