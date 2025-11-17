import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/response";

export async function GET(req: NextRequest) {
  try {
    const subscription = {
      id: "sub_1",
      userId: "1",
      plan: "pro",
      status: "active",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    return NextResponse.json(successResponse(subscription));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to fetch subscription"
      ),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newSubscription = {
      id: `sub_${Date.now()}`,
      userId: body.userId,
      plan: body.plan,
      status: "active",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };

    return NextResponse.json(successResponse(newSubscription), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to create subscription"
      ),
      { status: 400 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();

    const updatedSubscription = {
      id: body.id,
      userId: body.userId,
      plan: body.plan,
      status: body.status || "active",
      createdAt: new Date(body.createdAt),
      expiresAt: new Date(body.expiresAt),
    };

    return NextResponse.json(successResponse(updatedSubscription));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to update subscription"
      ),
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    return NextResponse.json(
      successResponse({ message: "Subscription deleted successfully" })
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error
          ? error.message
          : "Failed to delete subscription"
      ),
      { status: 500 }
    );
  }
}
