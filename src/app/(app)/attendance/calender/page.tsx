// app/attendance/calendar/page.tsx
"use client";
import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useSearchParams } from "next/navigation";

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [dailyData, setDailyData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const userId = "YOUR_USER_ID_HERE"; 
  const searchParams = useSearchParams();
  const dateParam = searchParams.get("date");
  useEffect(() => {
    if (dateParam) setSelectedDate(new Date(dateParam));
  }, [dateParam]);

  useEffect(() => {
    setLoading(true);
    const dateStr = selectedDate.toISOString();
    fetch(`/api/attendance/daily?userId=${userId}&date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => {
        setDailyData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load daily attendance");
        setLoading(false);
      });
  }, [selectedDate, userId]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Calendar View</h2>
      <Calendar onChange={setSelectedDate} value={selectedDate} />
      {loading && <p className="mt-4">Loading data...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}
      {dailyData && (
        <div className="mt-6 p-4 bg-white rounded shadow">
          <h3 className="text-xl font-semibold mb-2">
            Daily Attendance on {selectedDate.toDateString()}
          </h3>
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(dailyData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
