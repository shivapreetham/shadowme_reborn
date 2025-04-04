import prisma from '@/lib/prismadb';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmails';

// Helper function to send email (you can reuse your existing email sending function)
async function sendPasswordResetEmail(email: string, username: string, verifyCode: string) {
  // You may already have a helper for sending emails like sendVerificationEmail
  // This is a placeholder - replace with your actual email sending logic
  try {
    // Reuse your email sending logic from sendVerificationEmail
    // You should modify it to use a password reset template instead
    
    // Example email content
    const subject = 'Reset your password for NIT JSR Hub';
    const text = `Hello ${username},\n\nYou requested to reset your password. Use this verification code to reset your password: ${verifyCode}\n\nThis code will expire in 1 hour.\n\nBest,\nNIT JSR Hub Team`;
    
    // Assuming you're using the same function from sendVerificationEmails.ts
    await sendVerificationEmail(email, subject, text);
    
    // This is just a placeholder - replace with your actual email sending logic
    console.log('Sending password reset email to:', email);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { 
      success: false, 
      message: 'Failed to send password reset email'
    };
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // For security, don't reveal if the user exists or not
    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return NextResponse.json(
        { success: true, message: 'If an account with this email exists, a reset code has been sent' },
        { status: 200 }
      );
    }

    // Generate a 6-digit verification code
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with verification code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verifyCode,
        verifyCodeExpiry
      }
    });

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, user.username, verifyCode);

    if (!emailResult.success) {
      return NextResponse.json(
        { success: false, message: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: 'Password reset email sent successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in forgot password:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}