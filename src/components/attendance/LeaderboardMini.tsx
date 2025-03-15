// components/LeaderboardMini.tsx
"use client";
import React, { useEffect, useState } from "react";

interface LeaderboardMiniProps {
  batch: string;
}

export default function LeaderboardMini({ batch }: LeaderboardMiniProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/leaderboard?batch=${batch}`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => setError("Failed to load leaderboard"));
  }, [batch]);

  return (
    <div className="bg-white p-6 rounded shadow">
      <h3 className="text-xl font-bold mb-4">Leaderboard (Top 5)</h3>
      {error && <p className="text-red-500">{error}</p>}
      <ul className="divide-y divide-gray-200">
        {users.map((user, index) => (
          <li key={user.id} className="py-2 flex justify-between">
            <span>
              {index + 1}. {user.username}
            </span>
            <span>{user.overallPercentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
