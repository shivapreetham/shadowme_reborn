import Sidebar from '@/components/chat/sidebar/Sidebar';
import ConversationList from './components/ConversationList';
import getConversations from '@/app/actions/getConversations';
import getUsers from '@/app/actions/getUsers';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Conversations | shatterbox - Your Ultimate Chat Experience',
};

export default async function ConversationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = await getConversations();
  const users = await getUsers();

  return (
    <Sidebar>
      <div className="h-full w-full">
        <ConversationList users={users} initialConversations={conversations} />
        {children}
      </div>
    </Sidebar>
  );
}
