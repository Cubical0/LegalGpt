import { NextRequest, NextResponse } from "next/server";
import { successResponse, errorResponse } from "@/lib/utils/response";
import { getLegalGuidance, analyzeLegalDocument } from "@/lib/ai/openai";
import { COUNTRIES } from "@/lib/constants";

interface GuidanceRequest {
  query: string;
  type?: "question" | "document_analysis";
  country?: string;
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

    const country = COUNTRIES.find((c) => c.code === body.country) || COUNTRIES[0];

    let guidance: string;

    if (body.type === "document_analysis") {
      guidance = await analyzeLegalDocument(body.query, country);
    } else {
      guidance = await getLegalGuidance(body.query, country);
    }

    return NextResponse.json(successResponse({ guidance }));
  } catch (error) {
    console.error("Legal guidance error:", error);
    return NextResponse.json(
      errorResponse(
        error instanceof Error ? error.message : "Failed to get guidance"
      ),
      { status: 500 }
    );
  }
}
