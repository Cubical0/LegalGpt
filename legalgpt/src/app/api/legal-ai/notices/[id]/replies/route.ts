import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { LegalNotice, NoticeReply } from '@/lib/legal-ai/models';
import { getLegalGuidance } from '@/lib/ai/openai';
import { getUserFromToken } from '@/lib/middleware/auth';
import { COUNTRIES } from '@/lib/constants';

interface ReplyRequest {
  content: string;
  replyType: 'draft' | 'formal' | 'response';
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const notice = await LegalNotice.findById(id);

    if (!notice) {
      return NextResponse.json(
        errorResponse('Notice not found'),
        { status: 404 }
      );
    }

    if (notice.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    const body: ReplyRequest = await req.json();

    if (!body.content || !body.replyType) {
      return NextResponse.json(
        errorResponse('Content and replyType are required'),
        { status: 400 }
      );
    }

    const analysis = await getLegalGuidance(
      `Review this legal reply to a ${notice.noticeType}:\n\nOriginal Notice:\n${notice.content}\n\nProposed Reply:\n${body.content}`,
      COUNTRIES[0]
    );

    const result = await NoticeReply.create({
      noticeId: id,
      userId: user.userId,
      content: body.content,
      replyType: body.replyType,
      analysis,
    });

    const reply = await NoticeReply.findById(result.insertedId);

    return NextResponse.json(successResponse(reply), { status: 201 });
  } catch (error) {
    console.error('Error creating reply:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to create reply'
      ),
      { status: 500 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const notice = await LegalNotice.findById(id);

    if (!notice) {
      return NextResponse.json(
        errorResponse('Notice not found'),
        { status: 404 }
      );
    }

    if (notice.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    const replies = await NoticeReply.findByNoticeId(id);

    return NextResponse.json(successResponse(replies));
  } catch (error) {
    console.error('Error fetching replies:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch replies'
      ),
      { status: 500 }
    );
  }
}
