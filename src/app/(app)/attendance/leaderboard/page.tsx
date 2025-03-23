"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function LeaderboardPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email;
  // Extract batch from email (first 8 characters)
  const batch = userEmail ? userEmail.substring(0, 8).toUpperCase() : null;

  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!batch) return;
    fetch(`/api/attendance/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        setLeaderboard(data);
        setFilteredLeaderboard(data);
        // Extract unique subjects from all students' subject metrics

        const subjSet = new Set<string>();
        data.forEach((student: any) => {
          student.subjects.forEach((sub: any) => {
            if (sub.subjectCode) subjSet.add(sub.subjectCode);
          });
        });
        setSubjects(Array.from(subjSet));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load leaderboard");
        setLoading(false);
      });
  }, [batch]);
  console.log(leaderboard)
  useEffect(() => {
    if (selectedSubject) {
      const filtered = leaderboard
        .map((student: any) => {
          // Find subject-specific percentage, if available
          const subj = student.subjects.find(
            (s: any) => s.subjectCode === selectedSubject
          );
          if (subj) {
            return {
              ...student,
              overallPercentage: subj.attendancePercentage, // override with subject percentage
            };
          }
          return null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => parseFloat(b.overallPercentage) - parseFloat(a.overallPercentage));
      setFilteredLeaderboard(filtered);
    } else {
      // No subject selected; show overall leaderboard
      setFilteredLeaderboard(leaderboard);
    }
  }, [selectedSubject, leaderboard]);

  return (
    <div className="p-4">
      <h2 className="text-3xl font-bold mb-4">Leaderboard</h2>
      {loading && <p className="text-blue-500">Loading leaderboard...</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="subject-filter" className="font-semibold mr-2">Filter by Subject:</label>
        <select
          id="subject-filter"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Overall</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>
      </div>
      {!loading && filteredLeaderboard.length === 0 && <p>No data available</p>}
      <table className="w-full border-collapse border border-gray-300 bg-white shadow rounded">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">Rank</th>
            <th className="border p-2">Username</th>
            <th className="border p-2">{selectedSubject ? `${selectedSubject} %` : "Overall %"}</th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaderboard.map((user, index) => (
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
