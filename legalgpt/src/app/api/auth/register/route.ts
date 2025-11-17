import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { User } from "@/lib/db/models/User";
import { generateToken } from "@/lib/auth/jwt";
import { AuthPayload } from "@/types";

interface RegisterPayload extends AuthPayload {
  name: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: RegisterPayload = await req.json();

    if (!body.email || !body.password || !body.name) {
      return NextResponse.json(
        errorResponse("Name, email, and password are required"),
        { status: 400 }
      );
    }

    console.log("Registering user:", body.email);

    const result = await User.create({
      name: body.name,
      email: body.email,
      password: body.password,
    });

    console.log("User created with ID:", result.insertedId);

    const newUser = await User.findById(result.insertedId);

    if (!newUser) {
      throw new Error("Failed to retrieve created user");
    }

    const token = generateToken({
      userId: newUser._id!.toString(),
      email: newUser.email,
    });

    console.log("Registration successful for:", newUser.email);

    return NextResponse.json(
      successResponse({
        token,
        user: {
          id: newUser._id?.toString(),
          email: newUser.email,
          name: newUser.name,
        },
      }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Registration failed"
      ),
      { status: 400 }
    );
  }
}
