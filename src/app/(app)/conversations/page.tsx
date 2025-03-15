'use client';

import { useEffect } from 'react';
import clsx from 'clsx';
import useConversation from '@/app/hooks/useConversation';
import EmptyState from '@/components/chat/EmptyState';

const Home = () => {
  const { isOpen } = useConversation();

  return (
    <div
      className={clsx(
        'lg:pl-60 h-full lg:block theme-transition',
        'bg-background/50 backdrop-sm',
        isOpen ? 'block' : 'hidden'
      )}
    >
      <div className="h-full flex  justify-center p-4">
        <div className={clsx(
          'glass-card shadow-card hover:shadow-card-hover',
          'w-full max-w-3xl rounded-lg overflow-hidden',
          'theme-transition'
        )}>
          <EmptyState />
        </div>
      </div>
    </div>
  );
};

export default Home;