import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { NoticeReply } from '@/lib/legal-ai/models';
import { getUserFromToken } from '@/lib/middleware/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> }
) {
  try {
    const { replyId } = await params;
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const reply = await NoticeReply.findById(replyId);

    if (!reply) {
      return NextResponse.json(
        errorResponse('Reply not found'),
        { status: 404 }
      );
    }

    if (reply.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    return NextResponse.json(successResponse(reply));
  } catch (error) {
    console.error('Error fetching reply:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch reply'
      ),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> }
) {
  try {
    const { replyId } = await params;
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const reply = await NoticeReply.findById(replyId);

    if (!reply) {
      return NextResponse.json(
        errorResponse('Reply not found'),
        { status: 404 }
      );
    }

    if (reply.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    const body = await req.json();
    await NoticeReply.updateById(replyId, body);
    const updatedReply = await NoticeReply.findById(replyId);

    return NextResponse.json(successResponse(updatedReply));
  } catch (error) {
    console.error('Error updating reply:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to update reply'
      ),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; replyId: string }> }
) {
  try {
    const { replyId } = await params;
    const user = getUserFromToken(req);

    if (!user) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const reply = await NoticeReply.findById(replyId);

    if (!reply) {
      return NextResponse.json(
        errorResponse('Reply not found'),
        { status: 404 }
      );
    }

    if (reply.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    await NoticeReply.deleteById(replyId);

    return NextResponse.json(successResponse({ message: 'Reply deleted' }));
  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to delete reply'
      ),
      { status: 500 }
    );
  }
}
