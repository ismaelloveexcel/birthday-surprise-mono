/**
 * DEPRECATED — use POST /api/checkout instead.
 * This route now proxies to /api/checkout for backwards compatibility.
 * Migrated from Stripe to Lemon Squeezy.
 */
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = await req.json();
  const checkoutRes = await fetch(
    new URL("/api/checkout", req.url).toString(),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
  const data = await checkoutRes.json();
  return NextResponse.json(data, { status: checkoutRes.status });
}
