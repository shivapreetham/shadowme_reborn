// app/api/attendance/daily/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");
  if (!userId || !date)
    return NextResponse.json({ error: "User ID and date are required" }, { status: 400 });

  try {
    const dailyAttendance = await prisma.dailyAttendance.findFirst({
      where: {
        userId,
        date: new Date(date)
      },
      include: { subjects: true },
    });
    return NextResponse.json(dailyAttendance);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
