// app/attendance/leaderboard/page.tsx
"use client";
import { useEffect, useState } from "react";

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [error, setError] = useState("");
  const batch = "2023UGCSME"; 
  useEffect(() => {
    fetch(`/api/leaderboard?batch=${batch}`)
      .then((res) => res.json())
      .then((data) => setLeaderboard(data))
      .catch(() => setError("Failed to load leaderboard"));
  }, [batch]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">Leaderboard</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <table className="w-full border-collapse border border-gray-300 bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Rank</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">Overall %</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user, index) => (
            <tr key={user.id} className="text-center">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{user.username}</td>
              <td className="border p-2">{user.overallPercentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
