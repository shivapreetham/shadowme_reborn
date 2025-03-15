// app/attendance/page.tsx
"use client";
import { useState, useEffect } from "react";
import AttendanceCard from "@/components/attendance/AttendanceCard";
import AttendanceChart from "@/components/attendance/AttendanceChart";
import getCurrentUser from "@/app/actions/getCurrentUser";

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  // Replace this with your authentication logic to get the logged in user ID.
  const userId = getCurrentUser();

  useEffect(() => {
    fetch(`/api/attendance/current?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setAttendanceData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load attendance data");
        setLoading(false);
      });
  }, [userId]);

  if (loading) return <p>Loading attendance data...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">My Attendance</h1>
      {attendanceData ? (
        <>
          <AttendanceCard data={attendanceData} />
          <AttendanceChart data={attendanceData.subjects} />
        </>
      ) : (
        <p>No attendance data available.</p>
      )}
    </div>
  );
}
