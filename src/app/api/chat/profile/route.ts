import getCurrentUser from '@/app/actions/getCurrentUser';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();
    const body = await request.json();
    const { image } = body;
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    console.log(image)
    const updatedUser = await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        image,
      },
    });
    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.log(error, 'ERROR_PROFILE_UPDATE');
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
