import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { User } from "@/lib/db/models/User";
import { generateToken } from "@/lib/auth/jwt";
import { AuthPayload } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body: AuthPayload = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json(
        errorResponse("Email and password are required"),
        { status: 400 }
      );
    }

    const user = await User.findByEmail(body.email);
    if (!user) {
      return NextResponse.json(
        errorResponse("Invalid email or password"),
        { status: 401 }
      );
    }

    const isPasswordValid = await User.verifyPassword(
      body.password,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        errorResponse("Invalid email or password"),
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: user._id!.toString(),
      email: user.email,
    });

    return NextResponse.json(
      successResponse({
        token,
        user: {
          id: user._id?.toString(),
          email: user.email,
          name: user.name,
        },
      })
    );
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Login failed"
      ),
      { status: 500 }
    );
  }
}
