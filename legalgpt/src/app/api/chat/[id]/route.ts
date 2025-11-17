import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { ChatConversation } from '@/lib/db/models';
import { getUserFromToken } from '@/lib/middleware/auth';

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

    const conversation = await ChatConversation.findById(id);

    if (!conversation) {
      return NextResponse.json(
        errorResponse('Conversation not found'),
        { status: 404 }
      );
    }

    if (conversation.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    return NextResponse.json(successResponse(conversation));
  } catch (error) {
    console.error('Error fetching conversation:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to fetch conversation'
      ),
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const conversation = await ChatConversation.findById(id);

    if (!conversation) {
      return NextResponse.json(
        errorResponse('Conversation not found'),
        { status: 404 }
      );
    }

    if (conversation.userId !== user.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    await ChatConversation.deleteById(id);

    return NextResponse.json(successResponse({ message: 'Conversation deleted' }));
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to delete conversation'
      ),
      { status: 500 }
    );
  }
}
