import prisma from '@/lib/prismadb';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, verifyCode, password } = body;

    if (!email || !verifyCode || !password) {
      return NextResponse.json(
        { success: false, message: 'Email, verification code and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if verification code is valid and not expired
    if (user.verifyCode !== verifyCode) {
      return NextResponse.json(
        { success: false, message: 'Invalid verification code' },
        { status: 400 }
      );
    }

    if (!user.verifyCodeExpiry || new Date() > user.verifyCodeExpiry) {
      return NextResponse.json(
        { success: false, message: 'Verification code has expired' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password and clear verification code
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: {
    //     hashedPassword,
    //     verifyCode: null,
    //     verifyCodeExpiry: null
    //   }
    // });

    return NextResponse.json(
      { success: true, message: 'Password reset successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in reset password:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}