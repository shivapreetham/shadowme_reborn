"use client";

import { useState, useEffect, Suspense } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function CalendarPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const searchParams = useSearchParams();

  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [monthData, setMonthData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const parsedDate = new Date(dateParam);
      if (!isNaN(parsedDate.getTime())) setSelectedDate(parsedDate);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!userId || !selectedDate) return;

    setLoading(true);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;

    fetch(`/api/attendance/calendar/monthly?year=${year}&month=${month}`)
      .then((res) => res.json())
      .then((data) => {
        setMonthData(
          data.reduce((acc: Record<string, any>, record: any) => {
            acc[record.date.split("T")[0]] = record;
            return acc;
          }, {})
        );
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load monthly attendance");
        setLoading(false);
      });
  }, [selectedDate?.toISOString(), userId]);

  return (
    <Suspense fallback={<div>Loading Calendar...</div>}>
      <div className="p-4">
        <h2 className="text-3xl font-bold mb-4">Calendar View</h2>
        <DayPicker
          mode="single"
          selected={selectedDate || undefined}
          onSelect={(day) => {
            if (day) setSelectedDate(day);
          }}
          modifiers={{
            attended: Object.keys(monthData).map((date) => new Date(date)),
          }}
          modifiersClassNames={{
            attended: "bg-green-200 rounded-full",
          }}
        />
        {loading && <p className="mt-4">Loading data...</p>}
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {selectedDate && monthData[selectedDate.toISOString().split("T")[0]] && (
          <div className="mt-6 p-4 bg-white rounded shadow">
            <h3 className="text-xl font-semibold mb-2">
              Attendance on {selectedDate.toDateString()}
            </h3>
            <pre className="text-sm whitespace-pre-wrap">
              {JSON.stringify(monthData[selectedDate.toISOString().split("T")[0]], null, 2)}
            </pre>
          </div>
        )}
      </div>
    </Suspense>
  );
}
