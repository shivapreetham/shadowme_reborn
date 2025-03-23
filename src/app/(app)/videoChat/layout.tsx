import { ReactNode } from 'react';
import getCurrentUser from '@/app/actions/getCurrentUser';
import { CurrentUserProvider } from '@/context/CurrentUserProvider';
import StreamVideoProvider from '@/context/StreamClientProvider';

export default async function RootLayout({ children }: { children: ReactNode }) {
 
  const currentUser = await getCurrentUser();

  return (
    <main>
      <CurrentUserProvider currentUser={currentUser}>
        <StreamVideoProvider>{children}</StreamVideoProvider>
      </CurrentUserProvider>
    </main>
  );
}
