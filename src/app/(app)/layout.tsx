import ActiveStatus from '@/components/chat/ActiveStatus';
import { Metadata } from 'next';
import Sidebar from '@/components/sidebar/Sidebar';
interface RootLayoutProps {
  children: React.ReactNode;
}
export const metadata: Metadata = {
  title: 'NIT JSR Hub | shadowme - Your goto website for NIT JSR',
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