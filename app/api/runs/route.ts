import { NextResponse } from "next/server";
import { getRuns } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getRuns());
}
