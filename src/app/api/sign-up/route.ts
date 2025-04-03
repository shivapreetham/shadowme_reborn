import prisma from '@/lib/prismadb';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmails';

// Email pattern to extract information
const EMAIL_PATTERN = /^(\d{4})(ug|pg)([a-z]+)\d+@nitjsr\.ac\.in$/i;

// Maps for branch and course information
const branchMap = {
  ug: 'Undergraduate',
  pg: 'Postgraduate',
};

const courseMap = {
  cs: 'Computer Science and Engineering',
  ec: 'Electronics and Communication Engineering',
  ee: 'Electrical Engineering',
  ce: 'Civil Engineering',
  me: 'Mechanical Engineering',
  mm: 'Metallurgical and Materials Engineering',
  pi: 'Production and Industrial Engineering',
  csca: 'Master in Computer Applications',
  phd: 'PhD',
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
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
    
    // Parse email to extract batch, branch, and course
    const emailMatch = email.match(EMAIL_PATTERN);
    
    let batch = null;
    let branch = null;
    let course = null;
    
    if (emailMatch) {
      const [, batchValue, branchCode, courseCode] = emailMatch;
      
      batch = batchValue;
      branch = branchMap[branchCode.toLowerCase() as keyof typeof branchMap] || branchCode.toUpperCase();
      course = courseMap[courseCode.toLowerCase() as keyof typeof courseMap] || courseCode.toUpperCase();
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
            isAcceptingAnonymousMessages: true,
            batch,
            branch,
            course
          },
        });
      }
    } else {
      // Create new user if email doesn't exist
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour expiry

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
          isAcceptingAnonymousMessages: true,
          batch,
          branch,
          course
        },
      });
    }

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