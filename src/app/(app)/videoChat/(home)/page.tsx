'use client';

import MeetingTypeList from '@/components/videoChat/MeetingTypeList';

const Home = () => {
  const now = new Date();

  const time = now.toLocaleTimeString('en-India', { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat('en-India', { dateStyle: 'full' }).format(now);

  return (
    <section className="flex size-full flex-col gap-5 text-gray-800">
      <div className="h-64 w-full rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg relative overflow-hidden">
        {/* Abstract circles */}
        <div className="absolute top-10 right-10 w-20 h-20 rounded-full bg-white opacity-10"></div>
        <div className="absolute bottom-10 left-20 w-32 h-32 rounded-full bg-white opacity-5"></div>
        <div className="absolute top-20 left-40 w-16 h-16 rounded-full bg-white opacity-10"></div>
        
        <div className="flex h-full flex-col justify-between p-6 lg:p-8 relative z-10">
          <div className="backdrop-blur-md bg-white bg-opacity-20 max-w-xs rounded-full py-2 px-4 shadow-sm">
            <p className="text-center text-sm font-normal text-black">Upcoming Meeting at: 12:30 PM</p>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold lg:text-5xl text-black">{time}</h1>
            <p className="text-base font-medium text-blue-50 lg:text-lg">{date}</p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;