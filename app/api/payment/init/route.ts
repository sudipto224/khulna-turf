import { NextResponse } from "next/server";
import { initPayment, isPaymentConfigured } from "../../../../lib/payment";

// POST /api/payment/init — SSLCommerz session শুরু করো।
// Env vars না থাকলে 503 + PAYMENT_NOT_CONFIGURED ফেরত দেয় —
// তখন বুকিং পেজ demo payment চালায়, কিছু ভাঙে না।
export async function POST(req: Request) {
  if (!isPaymentConfigured()) {
    return NextResponse.json(
      { ok: false, error: "PAYMENT_NOT_CONFIGURED" },
      { status: 503 }
    );
  }
  try {
    const body = (await req.json()) as {
      tranId?: string;
      amount?: number;
      customerName?: string;
      customerPhone?: string;
      customerEmail?: string;
    };
    if (!body.tranId || !body.amount || !body.customerName || !body.customerPhone) {
      return NextResponse.json({ ok: false, error: "MISSING_FIELDS" }, { status: 400 });
    }
    const result = await initPayment({
      tranId: body.tranId,
      amount: body.amount,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
    });
    if (result.status === "ok") {
      return NextResponse.json({ ok: true, gatewayUrl: result.gatewayUrl, tranId: result.tranId });
    }
    return NextResponse.json(
      { ok: false, error: result.status === "not_configured" ? "PAYMENT_NOT_CONFIGURED" : result.message },
      { status: result.status === "not_configured" ? 503 : 502 }
    );
  } catch {
    return NextResponse.json({ ok: false, error: "BAD_REQUEST" }, { status: 400 });
  }
}
