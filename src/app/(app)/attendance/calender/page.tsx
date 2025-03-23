// "use client";

// import { useState, useEffect, useMemo, useCallback } from "react";
// import { DayPicker } from "react-day-picker";
// import "react-day-picker/dist/style.css";
// import { useSession } from "next-auth/react";
// import { useSearchParams } from "next/navigation";

// export default function CalendarPage() {
//   const { data: session } = useSession();
//   const userId = session?.user?.id;
//   const searchParams = useSearchParams();

//   const [selectedDate, setSelectedDate] = useState<Date | null>(null);
//   const [monthData, setMonthData] = useState<Record<string, any>>({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Extract date from URL params
//   useEffect(() => {
//     const dateParam = searchParams.get("date");
//     if (dateParam) {
//       const parsedDate = new Date(dateParam);
//       if (!isNaN(parsedDate.getTime())) setSelectedDate(parsedDate);
//     } else {
//       setSelectedDate(new Date());
//     }
//   }, [searchParams]);

//   // Function to fetch attendance data
//   const fetchAttendanceData = useCallback(async (year: number, month: number) => {
//     try {
//       setLoading(true);
//       const res = await fetch(`/api/attendance/calendar/monthly?year=${year}&month=${month}`);
//       const data = await res.json();
//       setMonthData(
//         data.reduce((acc: Record<string, any>, record: any) => {
//           acc[record.date.split("T")[0]] = record;
//           return acc;
//         }, {})
//       );
//     } catch {
//       setError("Failed to load monthly attendance");
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   // Fetch data when selectedDate changes
//   useEffect(() => {
//     if (!userId || !selectedDate) return;
//     const year = selectedDate.getFullYear();
//     const month = selectedDate.getMonth() + 1;
//     fetchAttendanceData(year, month);
//   }, [selectedDate, userId, fetchAttendanceData]);

//   // Memoized list of attended days
//   const attendedDays = useMemo(() => Object.keys(monthData).map((date) => new Date(date)), [monthData]);

//   return (
//     <div className="p-4">
//       <h2 className="text-3xl font-bold mb-4">Calendar View</h2>
//       <DayPicker
//         mode="single"
//         selected={selectedDate || undefined}
//         onSelect={(day) => {
//           if (day) setSelectedDate(day);
//         }}
//         modifiers={{ attended: attendedDays }}
//         modifiersClassNames={{ attended: "bg-green-200 rounded-full" }}
//       />
//       {loading && <p className="mt-4">Loading data...</p>}
//       {error && <p className="mt-4 text-red-500">{error}</p>}
//       {selectedDate && monthData[selectedDate.toISOString().split("T")[0]] && (
//         <div className="mt-6 p-4 bg-white rounded shadow">
//           <h3 className="text-xl font-semibold mb-2">
//             Attendance on {selectedDate.toDateString()}
//           </h3>
//           <pre className="text-sm whitespace-pre-wrap">
//             {JSON.stringify(monthData[selectedDate.toISOString().split("T")[0]], null, 2)}
//           </pre>
//         </div>
//       )}
//     </div>
//   );
// }

import React from 'react'

const page = () => {
  return (
    <div>
      calender
    </div>
  )
}

export default page
