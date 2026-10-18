import { NextRequest, NextResponse } from "next/server";
import { executeTriEngineOptimization } from "@/lib/ai-engines";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sourceCode = body?.sourceCode || "";

    if (!sourceCode || typeof sourceCode !== "string") {
      return NextResponse.json({ error: "Invalid sourceCode parameter" }, { status: 400 });
    }

    const result = await executeTriEngineOptimization(sourceCode);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Optimize API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
