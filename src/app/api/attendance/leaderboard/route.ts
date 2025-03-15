import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const batch = searchParams.get("batch");
  const subject = searchParams.get("subject"); // optional filter

  if (!batch)
    return NextResponse.json({ error: "Batch parameter is required" }, { status: 400 });

  try {
    // Filter users by batch pattern in their email.
    let users = await prisma.user.findMany({
      where: {
        email: {
          startsWith: batch, // Using startsWith for efficient filtering
        },
      },
      include: {
        subjects: true, // Include attendance metrics (subjects)
      },
      orderBy: {
        overallPercentage: "desc",
      },
    });

    // Optionally filter by subject if provided
    if (subject) {
      users = users.filter(user =>
        user.subjects.some((s) => s.subjectCode === subject)
      );
    }

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
