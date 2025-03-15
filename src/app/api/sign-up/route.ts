import prisma from '@/lib/prismadb';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmails';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // console.log(body)
    if (!body) {
      return Response.json(
        { success: false, message: 'No request body provided' },
        { status: 400 }
      );
    }

    const { username, email, password, NITUsername, NITPassword} = body;

    // Validate required fields
    if (!username || !email || !password || !NITUsername || !NITPassword) {
      return Response.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }
    // Check if user exists with verified username
    const existingVerifiedUserByUsername = await prisma.user.findFirst({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingVerifiedUserByUsername) {
      return Response.json(
        { success: false, message: 'Username already exists.' },
        { status: 400 }
      );
    }
    // Check if user exists with the same email
    const existingUserByEmail = await prisma.user.findFirst({
      where: { email },
    });
    // console.log(existingUserByEmail)
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return Response.json(
          { success: false, message: 'User already exists with this email' },
          { status: 400 }
        );
      } else {
        // Update existing unverified user
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
          where: { email },
          data: {
            username,
            email,
            hashedPassword,
            NITUsername,
            NITPassword,
            verifyCode,
            verifyCodeExpiry: new Date(Date.now() + 3600000),
            isVerified: false,
            isAcceptingAnonymousMessages: true
          },
        });
      }
    } else {

      // Create new user if email doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry

    console.log("came until here")

      await prisma.user.create({
        data: {
          username,
          email,
          hashedPassword,
          NITUsername,
          NITPassword,
          verifyCode,
          verifyCodeExpiry: expiryDate,
          isVerified: false,
          isAcceptingAnonymousMessages: true
        },
      });
    }
    console.log("came until here")

    // Send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      console.error('Error sending verification email:', emailResponse.message);
      return Response.json(
        {
          success: false,
          message: emailResponse.message,
        },
        { status: 500 }
      );
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please verify your account.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error registering user:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Error registering user.' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
}
}