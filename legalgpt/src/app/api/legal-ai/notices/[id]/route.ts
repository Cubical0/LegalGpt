import { NextRequest, NextResponse } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { LegalNotice } from '@/lib/legal-ai/models';
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

    return NextResponse.json(successResponse(notice));
  } catch (error) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to fetch notice'
      ),
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    const body = await req.json();
    await LegalNotice.updateById(id, body);
    const updatedNotice = await LegalNotice.findById(id);

    return NextResponse.json(successResponse(updatedNotice));
  } catch (error) {
    console.error('Error updating notice:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to update notice'
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

    await LegalNotice.deleteById(id);

    return NextResponse.json(successResponse({ message: 'Notice deleted' }));
  } catch (error) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : 'Failed to delete notice'
      ),
      { status: 500 }
    );
  }
}
