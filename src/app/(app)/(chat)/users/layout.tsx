import { Metadata } from 'next';
import getUsers from '@/app/actions/getUsers';
import Sidebar from '@/components/chat/sidebar/Sidebar';
import UserList from './components/UserList';

export const metadata: Metadata = {
  title: 'All Users | shatterbox - Your Ultimate Chat Experience',
};

export default async function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const users = await getUsers();

  return (
    <Sidebar>
      <div className=" h-full">
        <UserList users={users} />
        {children}
      </div>
    </Sidebar>
  );
}
