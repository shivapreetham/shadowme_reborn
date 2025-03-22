'use client';

import { useEffect, useState } from 'react';
import { StreamCall, StreamTheme } from '@stream-io/video-react-sdk';
import { useParams } from 'next/navigation';
import { Loader } from 'lucide-react';

import { useGetCallById } from '@/app/hooks/useGetCallById';
import Alert from '@/components/videoChat/Alert';
import getCurrentUser from '@/app/actions/getCurrentUser';
import MeetingSetup from '@/components/videoChat/MeetingSetup';
import MeetingRoom from '@/components/videoChat/MeetingRoom';

const MeetingPage = () => {
  const { id } = useParams();
  const meetingId = id as string;
  const { call, isCallLoading } = useGetCallById(meetingId);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const fetchedUser = await getCurrentUser();
      setUser(fetchedUser || null);
      setIsUserLoading(false);
    };

    fetchUser();
  }, []);

  if (!meetingId || isUserLoading || isCallLoading) return <Loader />;

  if (!call) return <p className="text-center text-3xl font-bold text-white">Call Not Found</p>;

  const notAllowed = call.type === 'invited' && (!user || !call.state.members.find(m => m.user.id === user.id));

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
