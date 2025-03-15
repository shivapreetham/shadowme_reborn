// app/attendance/layout.tsx
import Link from "next/link";
export default function AttendanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-blue-800 text-white p-4 shadow">
          <nav className="container mx-auto flex items-center justify-between">
            <h1 className="text-2xl font-bold">Attendance Dashboard</h1>
            <div className="flex gap-6">
              <Link href="/attendance/dashboard" className="hover:underline">
                Dashboard
              </Link>
              <Link href="/attendance/calendar" className="hover:underline">
                Calendar
              </Link>
              <Link href="/attendance/leaderboard" className="hover:underline">
                Leaderboard
              </Link>
            </div>
          </nav>
        </header>
        <main className="container mx-auto p-4">{children}</main>
      </div>
  );
}
