// // app/api/test/route.ts
// import prisma from '@/lib/prismadb';
// import { NextResponse } from 'next/server';

// export async function GET() {
//   try {
//     // Try a simple read-only operation first
//     const existingUser = await prisma.user.findUnique({
//       where: {
//         email: "test@test.com"
//       }
//     });

//     if (existingUser) {
//       return NextResponse.json({
//         success: true,
//         message: "Connection test successful - user exists",
//         user: existingUser
//       });
//     }

//     // If no existing user, try to create one
//     const user = await prisma.user.create({
//       data: {
//         username: "test_user",
//         email: "test@test.com",
//         verifyCode: "123456",
//         verifyCodeExpiry: new Date(),
//         NITUsername: "test123",
//         NITPassword: "test123",
//         isVerified: false,
//         isAcceptingAnonymousMessages: true,
//         honorScore: 100,
//         lastSeen: new Date(),
//         activeStatus: false,
//         conversationIds: [],
//         seenMessageIds: [],
//         createdAt: new Date(),
//         updatedAt: new Date()
//       }
//     });

//     return NextResponse.json({
//       success: true,
//       message: "User created successfully",
//       user
//     });

//   } catch (error) {
//     console.error('Prisma Error:', error);
    
//     // Fixed error response syntax
//     return NextResponse.json(
//       {
//         success: false,
//         message: error instanceof Error ? error.message : 'Unknown error'
//       }, 
//       { status: 500 }
//     );
//   }
// }


// app/api/test/online-status/route.ts
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current user's status
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        activeStatus: true,
        lastSeen: true,
      }
    });

    // Get all online users
    const onlineUsers = await prisma.user.findMany({
      where: { activeStatus: true },
      select: {
        id: true,
        email: true,
        username: true,
        lastSeen: true,
      }
    });

    return NextResponse.json({
      currentUser,
      onlineUsers,
      totalOnline: onlineUsers.length,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status test error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}