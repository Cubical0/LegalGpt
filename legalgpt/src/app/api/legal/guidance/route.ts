import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { getLegalGuidance, analyzeLegalDocument } from "@/lib/ai/openai";

interface GuidanceRequest {
  query: string;
  type?: "question" | "document";
}

export async function POST(req: NextRequest) {
  try {
    const body: GuidanceRequest = await req.json();

    if (!body.query || body.query.trim().length === 0) {
      return NextResponse.json(
        errorResponse("Query is required"),
        { status: 400 }
      );
    }

    let guidance: string;

    if (body.type === "document") {
      guidance = await analyzeLegalDocument(body.query);
    } else {
      guidance = await getLegalGuidance(body.query);
    }

    return NextResponse.json(successResponse({ guidance }));
  } catch (error) {
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to get guidance"
      ),
      { status: 500 }
    );
  }
}
