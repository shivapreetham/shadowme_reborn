import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/options"; // Ensure this exists!

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = session.user.id;
  const year = parseInt(searchParams.get("year") || "");
  const month = parseInt(searchParams.get("month") || "");

  if (isNaN(year) || isNaN(month)) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: new Date(year, month - 1, 1), // Start of month
          lt: new Date(year, month, 1), // Start of next month
        },
      },
      select: {
        date: true,
        // status: true,
        // subject: true,
      },
    });

    return NextResponse.json(attendanceRecords);
  } catch (error) {
    console.error("Error fetching attendance:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}
