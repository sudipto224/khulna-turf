import { NextResponse } from "next/server";

// SSLCommerz cancel callback — ব্যবহারকারী পেমেন্ট বাতিল করেছে।
function redirect(req: Request) {
  const url = new URL(req.url);
  const tranId = url.searchParams.get("tran_id") ?? "";
  const base = new URL("/booking", url.origin);
  base.searchParams.set("payment", "cancelled");
  if (tranId) base.searchParams.set("booking", tranId);
  return NextResponse.redirect(base);
}

export async function GET(req: Request) {
  return redirect(req);
}

export async function POST(req: Request) {
  return redirect(req);
}
