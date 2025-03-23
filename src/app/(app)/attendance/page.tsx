"use client";
import { useState, useEffect } from "react";
import AttendanceCard from "@/components/attendance/AttendanceCard";
import AttendanceChart from "@/components/attendance/AttendanceChart";

export default function AttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/attendance/current`)
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
  }, []);

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
