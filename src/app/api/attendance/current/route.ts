import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
export async function GET(request: Request) {
  // Get session data
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
//   console.log(userId)
  try {
    // Fetch the user's attendance record
    // console.log("fethcing the attendance records")
    const attendanceRecord = await prisma.attendance.findFirst({
      where: { userId },
      include: { subjects: true },
    });

    if (!attendanceRecord) {
      return NextResponse.json(
        { message: "No attendance record found" },
        { status: 404 }
      );
    }
    console.log(attendanceRecord)
    return NextResponse.json(attendanceRecord);
  } catch (error: any) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
