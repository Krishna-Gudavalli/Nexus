import { NextResponse } from "next/server";
import { getIntegrations } from "@/lib/ultimate-store";
export async function GET(){return NextResponse.json(await getIntegrations())}
