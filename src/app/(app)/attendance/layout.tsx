// app/attendance/layout.tsx
'use client';
import Link from "next/link";
import { Calendar, Trophy, User } from "lucide-react";

export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50" data-theme="light">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white shadow-md">
        <div className="container mx-auto py-3 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6" />
              <h1 className="text-xl font-semibold">Attendance Dashboard</h1>
            </div>
            
            <nav className="flex items-center">
              <Link 
                href="/attendance/calendar" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-l-md hover:bg-blue-600 transition-colors"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
              </Link>
              <Link 
                href="/attendance/leaderboard" 
                className="flex items-center gap-1.5 px-4 py-2 rounded-r-md hover:bg-blue-600 transition-colors"
              >
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
          <style jsx global>{`
            /* Force light theme colors for attendance section */
            [data-theme="dark"] .attendance-light-theme {
              --background: 0 0% 100%;
              --foreground: 222.2 84% 4.9%;
              --card: 0 0% 100%;
              --card-foreground: 222.2 84% 4.9%;
              --popover: 0 0% 100%;
              --popover-foreground: 222.2 84% 4.9%;
              --primary: 221.2 83.2% 53.3%;
              --primary-foreground: 210 40% 98%;
              --secondary: 210 40% 96.1%;
              --secondary-foreground: 222.2 47.4% 11.2%;
              --muted: 210 40% 96.1%;
              --muted-foreground: 215.4 16.3% 46.9%;
              --accent: 210 40% 96.1%;
              --accent-foreground: 222.2 47.4% 11.2%;
              --destructive: 0 84.2% 60.2%;
              --destructive-foreground: 210 40% 98%;
              --border: 214.3 31.8% 91.4%;
              --input: 214.3 31.8% 91.4%;
              --ring: 221.2 83.2% 53.3%;
              --radius: 0.5rem;
            }
          `}</style>
          <div className="attendance-light-theme">
            {children}
          </div>
        </div>
      </main>
      
      <footer className="container mx-auto py-4 px-4 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Student Attendance System</p>
      </footer>
    </div>
  );
}