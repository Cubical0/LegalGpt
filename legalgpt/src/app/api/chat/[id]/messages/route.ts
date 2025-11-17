import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { ChatConversation, IChatMessage } from '@/lib/db/models';
import { getUserFromToken } from '@/lib/middleware/auth';

interface MessageRequest {
  role: 'user' | 'assistant';
  content: string;
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

    const body: MessageRequest = await req.json();

    if (!body.content || !body.role) {
      return NextResponse.json(
        errorResponse('Content and role are required'),
        { status: 400 }
      );
    }

    const message: IChatMessage = {
      role: body.role,
      content: body.content,
      timestamp: new Date(),
    };

    await ChatConversation.addMessage(id, message);

    const updatedConversation = await ChatConversation.findById(id);

    return NextResponse.json(successResponse(updatedConversation), { status: 201 });
  } catch (error) {
    console.error('Error adding message:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to add message'
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

    return NextResponse.json(successResponse(conversation.messages));
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to fetch messages'
      ),
      { status: 500 }
    );
  }
}
