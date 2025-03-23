'use client';

import { useState } from 'react';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/app/hooks/useGetCallById';
import Alert from '@/components/videoChat/Alert';
import { useCurrentUserContext } from '@/context/CurrentUserProvider';
import MeetingSetup from '@/components/videoChat/MeetingSetup';
import MeetingRoom from '@/components/videoChat/MeetingRoom';

const MeetingPage = () => {
  const { id } = useParams();
  const meetingId = id as string;
  const { call, isCallLoading } = useGetCallById(meetingId);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  
  // Fetch user from context
  const { currentUser } = useCurrentUserContext();
  const isUserLoading = !currentUser;

  if (!meetingId || isUserLoading || isCallLoading) return <Loader />;

  if (!call) return <p className="text-center text-3xl font-bold text-white">Call Not Found</p>;

  const notAllowed = call.type === 'invited' && (!currentUser || !call.state.members.find(m => m.user.id === currentUser.id));

  if (notAllowed) return <Alert title="You are not allowed to join this meeting" />;

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>{!isSetupComplete ? <MeetingSetup setIsSetupComplete={setIsSetupComplete} /> : <MeetingRoom />}</StreamTheme>
      </StreamCall>
    </main>
  );
};

export default MeetingPage;
