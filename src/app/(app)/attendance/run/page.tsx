"use client";

import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const handleCheckRequest = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/");
      console.log("Response Status:", response.status);
      const data = await response.json();
      console.log("Response Data:", data);
    } catch (err:any)
     {
      setError("Request failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h2 className="text-2xl font-bold mb-4">Check GET Request</h2>
      
      <button
        onClick={handleCheckRequest}
        className="bg-blue-500 text-white p-2 rounded"
        disabled={loading}
      >
        {loading ? "Checking..." : "Check Request"}
      </button>
      
      {error && <p className="text-red-500 mt-3">{error}</p>}
    </main>
  );
}
