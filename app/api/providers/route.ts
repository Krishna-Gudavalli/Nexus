import { NextResponse } from "next/server";
import { getProviderConfigs, configuredProviderOrder } from "@/lib/provider-gateway";

export async function GET() {
  const providers = getProviderConfigs().map(p => ({ ...p, selected: configuredProviderOrder().includes(p.id) }));
  return NextResponse.json({ providers, primary: configuredProviderOrder()[0] || null, fallbackOrder: configuredProviderOrder().slice(1) });
}
