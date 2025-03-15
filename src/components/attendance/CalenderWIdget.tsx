// components/CalendarWidget.tsx
"use client";
import React from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useRouter } from "next/navigation";

export default function CalendarWidget() {
  const router = useRouter();
  const handleDateClick = (date: Date) => {
    router.push(`/attendance/calendar?date=${date.toISOString()}`);
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Calendar</h3>
      <Calendar onClickDay={handleDateClick} />
    </div>
  );
}
