import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { User } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const users: User[] = [
      {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
      },
    ];

    return NextResponse.json(successResponse(users));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to fetch users"
      ),
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newUser: User = {
      id: Date.now().toString(),
      name: body.name,
      email: body.email,
      createdAt: new Date(),
    };

    return NextResponse.json(successResponse(newUser), { status: 201 });
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to create user"
      ),
      { status: 400 }
    );
  }
}
