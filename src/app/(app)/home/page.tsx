"use client";

import Link from "next/link";
import { ArrowRight, MessageSquare, Video, Calendar, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white p-4 flex flex-col items-center">
      <div className="w-full max-w-7xl relative">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 font-sans">
            NIT JSR Hub
          </h1>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-5 gap-0 relative h-[600px]">
          {/* === CENTER CIRCLE (overlapping both rows) === */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
              {/* Halo around circle */}
              <div className="w-48 h-48 bg-gray-300 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              {/* Main circle */}
              <div className="w-36 h-36 bg-blue-700 rounded-full flex items-center justify-center shadow-lg relative z-10">
                <div className="text-white font-bold text-center">
                  <div className="text-xl">GET</div>
                  <div className="text-xl">STARTED</div>
                  <div className="text-xl">NOW</div>
                </div>
              </div>
            </div>
          </div>

          {/* === TOP LEFT (col 1) => Smart Chat === */}
          <div className="col-span-1 bg-white border-2 border-blue-500 shadow-md p-6 rounded-tl-xl">
            <MessageSquare className="text-blue-600 mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold text-slate-800 mb-2">Smart Chat</h2>
            <p className="text-slate-600 mb-4">
              Chat with friends using our AI-powered messaging system
            </p>
            <Link
              href="/conversations"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
            >
              Start chatting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* === TOP CENTER (col 2-4) => Banner === */}
          <div className="col-span-3 bg-gray-300 shadow-md p-6 flex flex-col items-center justify-center">
            <h3 className="text-xl font-medium text-slate-800 mb-2 text-center">
              Get your app for NIT Jamshedpur
            </h3>
            <p className="text-slate-600 text-center">
              Integrate with ours, let&apos;s get big together
            </p>
          </div>

          {/* === TOP RIGHT (col 5) => Anonymous Video === */}
          <div className="col-span-1 bg-gray-500 shadow-md p-6 rounded-tr-xl">
            <Video className="text-white mb-4 h-10 w-10" />
            <h2 className="text-xl font-bold text-white mb-2">Anonymous Video</h2>
            <p className="text-gray-200 mb-4">
              Voice and video with identity hidden, exciting filters included
            </p>
            <Link
              href="/video"
              className="inline-flex items-center text-white font-medium hover:text-gray-200"
            >
              Start a call <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* === BOTTOM ROW (col-span-5) => 2 flexible columns side by side === */}
          <div className="col-span-5 flex">
            {/* Bottom Left => Attendance Tracker */}
            <div className="flex-1 bg-gray-200 shadow-md p-6 rounded-bl-xl">
              <Calendar className="text-blue-600 mb-4 h-10 w-10" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">
                Attendance Tracker
              </h2>
              <p className="text-slate-600 mb-4">
                Monitor attendance, compete with classmates, and track your daily progress
              </p>
              <div className="mb-4">
                <div className="flex justify-between text-slate-700 text-sm mb-1">
                  <span>Your attendance</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  />
                </div>
              </div>
              <Link
                href="/attendance"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                View details <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>

            {/* Bottom Right => Campus Marketplace */}
            <div className="flex-1 bg-white shadow-md p-6 rounded-br-xl">
              <div className="flex justify-end">
                <ShoppingBag className="text-blue-600 mb-4 h-10 w-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-800 mb-2 text-right">
                Campus Marketplace
              </h2>
              <p className="text-slate-600 mb-4 text-right">
                Buy and sell second-hand items exclusively for NIT Jamshedpur students
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                  <span className="text-slate-700 text-xs font-medium">Laptop</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                  <span className="text-slate-700 text-xs font-medium">Books</span>
                </div>
                <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                  <span className="text-slate-700 text-xs font-medium">Furniture</span>
                </div>
              </div>
              <div className="flex justify-end">
                <Link
                  href="/olx"
                  className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
                >
                  Browse marketplace <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col space-y-4">
          {/* Center Circle */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-36 h-36 bg-blue-700 rounded-full flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-center text-lg">
                  GET<br />STARTED<br />NOW
                </div>
              </div>
            </div>
          </div>

          {/* Smart Chat */}
          <div className="bg-white border-2 border-blue-500 shadow-md p-4 rounded-xl">
            <MessageSquare className="text-blue-600 mb-2 h-8 w-8" />
            <h2 className="text-lg font-bold text-slate-800 mb-1">Smart Chat</h2>
            <p className="text-slate-600 mb-2">
              Chat with friends using our AI-powered messaging system
            </p>
            <Link
              href="/conversations"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
            >
              Start chatting <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Banner */}
          <div className="bg-gray-300 shadow-md p-4 rounded-xl">
            <h3 className="text-lg font-medium text-slate-800 mb-1 text-center">
              Get your app for NIT Jamshedpur
            </h3>
            <p className="text-slate-600 text-center">
              Integrate with ours, let us get big together
            </p>
          </div>

          {/* Anonymous Video */}
          <div className="bg-gray-500 shadow-md p-4 rounded-xl">
            <Video className="text-white mb-2 h-8 w-8" />
            <h2 className="text-lg font-bold text-white mb-1">Anonymous Video</h2>
            <p className="text-gray-200 mb-2">
              Voice and video with identity hidden, exciting filters included
            </p>
            <Link
              href="/video"
              className="inline-flex items-center text-white font-medium hover:text-gray-200"
            >
              Start a call <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Attendance Tracker */}
          <div className="bg-gray-200 shadow-md p-4 rounded-xl">
            <Calendar className="text-blue-600 mb-2 h-8 w-8" />
            <h2 className="text-lg font-bold text-slate-800 mb-1">Attendance Tracker</h2>
            <p className="text-slate-600 mb-2">
              Monitor attendance, compete with classmates, and track your daily progress
            </p>
            <div className="mb-2">
              <div className="flex justify-between text-slate-700 text-xs mb-1">
                <span>Your attendance</span>
                <span>85%</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
            </div>
            <Link
              href="/attendance"
              className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
            >
              View details <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Campus Marketplace */}
          <div className="bg-white shadow-md p-4 rounded-xl">
            <div className="flex justify-end">
              <ShoppingBag className="text-blue-600 mb-2 h-8 w-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-1 text-right">
              Campus Marketplace
            </h2>
            <p className="text-slate-600 mb-2 text-right">
              Buy and sell second-hand items exclusively for NIT Jamshedpur students
            </p>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                <span className="text-slate-700 text-xs font-medium">Laptop</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                <span className="text-slate-700 text-xs font-medium">Books</span>
              </div>
              <div className="bg-gray-100 rounded-lg p-2 aspect-square flex items-center justify-center shadow-sm">
                <span className="text-slate-700 text-xs font-medium">Furniture</span>
              </div>
            </div>
            <div className="flex justify-end">
              <Link
                href="/market"
                className="inline-flex items-center text-blue-600 font-medium hover:text-blue-800"
              >
                Browse marketplace <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer / Suggestion Link */}
        <div className="mt-8 text-center">
          <p className="text-slate-700">
            Want to add a feature?{" "}
            <Link href="/suggest" className="text-blue-600 hover:underline">
              Let us know
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
