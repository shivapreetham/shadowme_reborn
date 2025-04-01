"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  const router = useRouter();

  return (
    <main className="relative min-h-screen bg-gray-100">
      {/* Top banner text */}
      <div className="absolute top-0 left-0 w-full bg-white shadow p-4 z-10 text-center">
        <h1 className="text-2xl font-bold">
          Get your app for NIT Jamshedpur – integrate with ours, let’s get big together!
        </h1>
      </div>

      {/* Main container for the 5 sections */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Grid container */}
        <div className="relative w-full max-w-6xl h-[80vh] grid grid-cols-12 grid-rows-6 gap-4">
          {/* Top Left: AI Chat */}
          <Card className="col-span-3 row-span-3 flex flex-col justify-center items-center p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">AI Chat</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              Chat powered by AI. Chat with your friends!
            </p>
            <Button onClick={() => router.push("/conversations")}>
              Go to Chat
            </Button>
          </Card>

          {/* Top Right: Anonymous Video Chat */}
          <Card className="col-span-3 col-start-10 row-span-3 flex flex-col justify-center items-center p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Anonymous Video Chat</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              Video chat with your friends with hidden identity and exciting filters!
            </p>
            <Button onClick={() => router.push("/video-chat")}>
              Start Video Chat
            </Button>
          </Card>

          {/* Bottom Left: Attendance */}
          <Card className="col-span-5 row-span-3 row-start-4 flex flex-col justify-center items-center p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Attendance</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              See and monitor your attendance, compete with your mates and check your daily stats!
            </p>
            <Button onClick={() => router.push("/attendance")}>
              Check Attendance
            </Button>
          </Card>

          {/* Bottom Right: OLX for NIT JSR */}
          <Card className="col-span-5 col-start-8 row-span-3 row-start-4 flex flex-col justify-center items-center p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-2">NITJSR OLX</h2>
            <p className="text-sm text-gray-600 text-center mb-4">
              A second-hand shop for NIT Jamshedpur. Sell, buy & reuse your items!
            </p>
            <Button onClick={() => router.push("/olx")}>
              Go to Marketplace
            </Button>
          </Card>

          {/* Center Circle: Get Started Now */}
          <div className="col-span-4 col-start-5 row-span-2 row-start-3 flex items-center justify-center">
            <div className="relative">
              {/* Background gradient circle */}
              <div className="absolute inset-0 w-64 h-64 bg-gradient-to-b from-gray-300 to-transparent rounded-full blur-2xl" />
              <Button
                className="w-40 h-40 rounded-full text-xl font-bold z-10"
                onClick={() => alert("Get Started Now!")}
              >
                Get Started Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
