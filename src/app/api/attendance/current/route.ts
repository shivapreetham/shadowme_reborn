// app/api/attendance/current/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  if (!userId)
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  
  try {
    const attendanceRecord = await prisma.attendance.findFirst({
      where: { userId },
      include: { subjects: true },
    });
    return NextResponse.json(attendanceRecord);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
