// components/AttendanceCard.tsx
"use client";
import React from "react";

interface AttendanceCardProps {
  data: any;
}

export default function AttendanceCard({ data }: AttendanceCardProps) {
  return (
    <div className="bg-white p-6 rounded shadow mb-6">
      <h3 className="text-2xl font-bold mb-4">Current Attendance</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-100 rounded text-center">
          <p className="text-sm text-gray-600">Attended</p>
          <p className="text-xl font-semibold">{data.overallAttendedClasses}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded text-center">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-xl font-semibold">{data.overallTotalClasses}</p>
        </div>
        <div className="p-4 bg-gray-100 rounded text-center">
          <p className="text-sm text-gray-600">Percentage</p>
          <p className="text-xl font-semibold">{data.overallPercentage}%</p>
        </div>
      </div>
      <div className="mt-6">
        <h4 className="text-lg font-semibold mb-2">Subjects Breakdown</h4>
        <ul className="divide-y divide-gray-200">
          {data.subjects.map((sub: any) => (
            <li key={sub.subjectCode} className="py-2 flex justify-between">
              <span>
                {sub.subjectName} ({sub.subjectCode})
              </span>
              <span>
                {sub.attendedClasses}/{sub.totalClasses} ({sub.attendancePercentage}%)
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
