import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { LegalAIService } from '@/lib/legal-ai/services';
import { getUserFromToken } from '@/lib/middleware/auth';

interface QueryRequest {
  query: string;
  type?: 'question' | 'document_analysis';
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

    const body: QueryRequest = await req.json();

    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        errorResponse('Query is required'),
        { status: 400 }
      );
    }

    const result = await LegalAIService.processQuery(
      user.userId,
      body.query,
      body.type || 'question'
    );

    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to process query'
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

    const userData = await LegalAIService.getUserData(user.userId);

    return NextResponse.json(successResponse(userData));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch user data'
      ),
      { status: 500 }
    );
  }
}
