import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { ChatConversation } from '@/lib/db/models';
import { getUserFromToken } from '@/lib/middleware/auth';

interface ConversationRequest {
  title?: string;
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

    const body: ConversationRequest = await req.json();

    const result = await ChatConversation.create({
      userId: user.userId,
      title: body.title || 'New Conversation',
      messages: [],
    });

    const conversation = await ChatConversation.findById(result.insertedId);

    return NextResponse.json(successResponse(conversation), { status: 201 });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to create conversation'
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

    const conversations = await ChatConversation.findByUserId(user.userId);

    return NextResponse.json(successResponse(conversations));
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : 'Failed to fetch conversations'
      ),
      { status: 500 }
    );
  }
}
