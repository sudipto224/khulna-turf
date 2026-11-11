import { NextResponse } from "next/server";

// SSLCommerz success callback (GET বা POST দুটোই আসতে পারে)।
// TODO (পরে): এখানে val_id দিয়ে validatePayment() চালিয়ে bookings +
// payments টেবিলে status "paid" করো (service_role key দিয়ে)।
// এখন: ব্যবহারকারীকে তার বুকিং পেজে পাঠিয়ে দাও।
function redirect(req: Request) {
  const url = new URL(req.url);
  const tranId = url.searchParams.get("tran_id") ?? "";
  const base = new URL("/my-bookings", url.origin);
  base.searchParams.set("payment", "success");
  if (tranId) base.searchParams.set("booking", tranId);
  return NextResponse.redirect(base);
}

export async function GET(req: Request) {
  return redirect(req);
}

export async function POST(req: Request) {
  return redirect(req);
}
