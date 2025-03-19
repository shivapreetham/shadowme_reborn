// app/api/leaderboard/route.ts
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Extract batch from email: first 8 characters, uppercase.
  const userEmail = session.user.email;
  const batch = userEmail.substring(0, 8).toUpperCase();

  try {
    const students = await prisma.user.findMany({
      where: {
        email: { startsWith: batch },
      },
      orderBy: {
        overallPercentage: "desc",
      },
      select: {
        id: true,
        username: true,
        email: true,
        overallPercentage: true,
        subjects: true, // subject metrics
      },
    });
    return NextResponse.json(students);
  } catch (error: any) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
