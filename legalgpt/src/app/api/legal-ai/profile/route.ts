import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { getUserFromToken } from '@/lib/middleware/auth';
import { UserProfile } from '@/lib/legal-ai/models';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const profile = await UserProfile.findByUserId(user.userId);

    if (!profile) {
      await UserProfile.create(user.userId);
      const newProfile = await UserProfile.findByUserId(user.userId);
      return NextResponse.json(successResponse({ profile: newProfile }));
    }

    return NextResponse.json(successResponse({ profile }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch profile'
      ),
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body = await req.json();

    await UserProfile.updateById(user.userId, body);

    const updatedProfile = await UserProfile.findByUserId(user.userId);

    return NextResponse.json(successResponse({ profile: updatedProfile }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to update profile'
      ),
      { status: 500 }
    );
  }
}
