import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { LegalAIService } from '@/lib/legal-ai/services';
import { getUserFromToken } from '@/lib/middleware/auth';
import { LegalDocument } from '@/lib/legal-ai/models';

interface DocumentRequest {
  title: string;
  content: string;
  documentType: string;
  analysis?: string;
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

    const body: DocumentRequest = await req.json();

    if (!body.title || !body.content || !body.documentType) {
      return NextResponse.json(
        errorResponse('Title, content, and documentType are required'),
        { status: 400 }
      );
    }

    const result = await LegalAIService.saveDocument(
      user.userId,
      body.title,
      body.content,
      body.documentType,
      body.analysis
    );

    return NextResponse.json(successResponse(result), { status: 201 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to save document'
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

    const documents = await LegalDocument.findByUserId(user.userId);

    return NextResponse.json(successResponse({ documents }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch documents'
      ),
      { status: 500 }
    );
  }
}
