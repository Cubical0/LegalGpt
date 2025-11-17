import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { LegalNotice } from '@/lib/legal-ai/models';
import { getLegalGuidance } from '@/lib/ai/openai';
import { getUserFromToken } from '@/lib/middleware/auth';
import { COUNTRIES } from '@/lib/constants';

interface NoticeRequest {
  title: string;
  content: string;
  noticeType: string;
  sender?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const body: NoticeRequest = await req.json();

    if (!body.title || !body.content || !body.noticeType) {
      return NextResponse.json(
        errorResponse('Title, content, and noticeType are required'),
        { status: 400 }
      );
    }

    const analysis = await getLegalGuidance(
      `Analyze this legal notice:\n\nTitle: ${body.title}\n\nContent: ${body.content}\n\nType: ${body.noticeType}`,
      COUNTRIES[0]
    );

    const result = await LegalNotice.create({
      userId: user.userId,
      title: body.title,
      content: body.content,
      noticeType: body.noticeType,
      sender: body.sender,
      status: 'active',
      analysis,
    });

    const notice = await LegalNotice.findById(result.insertedId);

    return NextResponse.json(successResponse(notice), { status: 201 });
  } catch (error) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to create notice'
      ),
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const notices = await LegalNotice.findByUserId(user.userId);

    return NextResponse.json(successResponse(notices));
  } catch (error) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch notices'
      ),
      { status: 500 }
    );
  }
}
