import ActiveStatus from '@/components/chat/ActiveStatus';
import { Metadata } from 'next';
import Sidebar from '@/components/chat/sidebar/Sidebar';
interface RootLayoutProps {
  children: React.ReactNode;
}
export const metadata: Metadata = {
  title: 'Dashboard | shatterbox - Your Ultimate Chat Experience',
};

export default async function RootLayout({ children }: RootLayoutProps) {
  return (
    <Sidebar>
    <div className="flex flex-col h-screen pb-5">
      {/* <Navbar /> */}
      {children}
      <ActiveStatus />
    </div>
    </Sidebar>
  );
}