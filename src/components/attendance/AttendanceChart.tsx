// components/AttendanceChart.tsx
"use client";
import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface AttendanceChartProps {
  data: any[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  const labels = data.map((item) => item.subjectName);
  const attendedData = data.map((item) => item.attendedClasses);
  const totalData = data.map((item) => item.totalClasses);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Attended",
        data: attendedData,
        backgroundColor: "rgba(34, 197, 94, 0.7)", // Tailwind green-500
      },
      {
        label: "Total",
        data: totalData,
        backgroundColor: "rgba(59, 130, 246, 0.7)", // Tailwind blue-500
      },
    ],
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Attendance Chart</h3>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          plugins: {
            legend: { position: "top" },
            title: { display: true, text: "Subject Attendance" },
          },
        }}
      />
    </div>
  );
}
