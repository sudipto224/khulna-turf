import { NextResponse } from "next/server";
import { validatePayment } from "../../../../lib/payment";

// SSLCommerz IPN (Instant Payment Notification) — সার্ভার-টু-সার্ভার।
// val_id পেলে validatePayment() দিয়ে যাচাই করো; valid হলে পরে এখানেই
// bookings/payments টেবিল আপডেট করবে (service_role key দিয়ে)।
// Env vars না থাকলে শুধু { ok: true } ফেরত দেয় — IPN হারায় না,
// SSLCommerz আবার চেষ্টা করে।
export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const valId = String(form.get("val_id") ?? "");
    const tranId = String(form.get("tran_id") ?? "");
    if (!valId) return NextResponse.json({ ok: false, error: "NO_VAL_ID" }, { status: 400 });
    const valid = await validatePayment(valId);
    // TODO (পরে): valid হলে Supabase-এ payments + bookings status "paid" করো।
    return NextResponse.json({ ok: true, tran_id: tranId, valid });
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  }
}
