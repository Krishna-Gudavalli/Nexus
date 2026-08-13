import { NextResponse } from "next/server";
import { toolDefinitions } from "@/lib/tools";

export async function GET() {
  return NextResponse.json(toolDefinitions);
}
