// ─────────────────────────────────────────────────────────────
// Khulna Turf — payment provider (v3, code only, no credentials).
// SSLCommerz (bKash / Nagad / Rocket / Card — সব SSLCommerz দিয়েই আসে)।
// Env vars না থাকলে সব function "PAYMENT_NOT_CONFIGURED" ফেরত দেয় —
// তখন বুকিং পেজের আগের demo payment চলবে, সাইট ভাঙবে না।
// TODO (পরে): SSLCommerz sandbox keys দিয়ে টেস্ট, তারপর live keys বসাও
// (Vercel env vars: SSLCOMMERZ_STORE_ID, SSLCOMMERZ_STORE_PASSWORD,
// SSLCOMMERZ_SANDBOX=false)। টাকা যাবে ক্লায়েন্টের মার্চেন্ট অ্যাকাউন্টে,
// তাই keys শুধু ওনারই দিতে পারবে — কখনও কোডে/চ্যাটে আসল keys বসাবে না।
// ─────────────────────────────────────────────────────────────

export type PaymentInitResult =
  | { status: "not_configured" }
  | { status: "ok"; gatewayUrl: string; tranId: string }
  | { status: "error"; message: string };

export function isPaymentConfigured(): boolean {
  return Boolean(
    process.env.SSLCOMMERZ_STORE_ID && process.env.SSLCOMMERZ_STORE_PASSWORD
  );
}

function gatewayBase(): string {
  const sandbox = process.env.SSLCOMMERZ_SANDBOX !== "false"; // default: sandbox
  return sandbox
    ? "https://sandbox.sslcommerz.com"
    : "https://securepay.sslcommerz.com";
}

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"
  );
}

export type InitPaymentInput = {
  tranId: string; // booking id, e.g. KT-20261105-1234
  amount: number; // advance amount in BDT
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
};

/** Start an SSLCommerz payment session. Server-side only. */
export async function initPayment(input: InitPaymentInput): Promise<PaymentInitResult> {
  if (!isPaymentConfigured()) return { status: "not_configured" };
  const base = siteUrl();
  const params = new URLSearchParams({
    store_id: process.env.SSLCOMMERZ_STORE_ID as string,
    store_passwd: process.env.SSLCOMMERZ_STORE_PASSWORD as string,
    total_amount: String(input.amount),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: `${base}/api/payment/success`,
    fail_url: `${base}/api/payment/fail`,
    cancel_url: `${base}/api/payment/cancel`,
    ipn_url: `${base}/api/payment/ipn`,
    cus_name: input.customerName,
    cus_email: input.customerEmail || "customer@khulnaturf.com",
    cus_phone: input.customerPhone,
    cus_add1: "Khulna",
    cus_city: "Khulna",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    product_name: "Khulna Turf slot booking",
    product_category: "Sports",
    product_profile: "general",
  });
  try {
    const res = await fetch(`${gatewayBase()}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };
    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return { status: "ok", gatewayUrl: data.GatewayPageURL, tranId: input.tranId };
    }
    return { status: "error", message: data.failedreason || "SSLCommerz init failed" };
  } catch (e) {
    return { status: "error", message: e instanceof Error ? e.message : "Network error" };
  }
}

/** Validate an SSLCommerz IPN / callback (val_id -> validation API). */
export async function validatePayment(valId: string): Promise<boolean> {
  if (!isPaymentConfigured()) return false;
  try {
    const url =
      `${gatewayBase()}/validator/api/validationserverAPI.php` +
      `?val_id=${encodeURIComponent(valId)}` +
      `&store_id=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_ID as string)}` +
      `&store_passwd=${encodeURIComponent(process.env.SSLCOMMERZ_STORE_PASSWORD as string)}` +
      `&v=1&format=json`;
    const res = await fetch(url);
    const data = (await res.json()) as { status?: string };
    return data.status === "VALID" || data.status === "VALIDATED";
  } catch {
    return false;
  }
}
