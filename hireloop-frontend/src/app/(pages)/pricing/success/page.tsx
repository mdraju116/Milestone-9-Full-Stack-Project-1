import { headers } from "next/headers";
import Link from "next/link";

type SuccessProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function SuccessPage({ searchParams }: SuccessProps) {
  const { session_id: sessionId } = await searchParams;
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL?.trim().replace(/\/$/, "");
  let message = "";
  let verified = false;

  if (!sessionId) {
    message = "The checkout session ID is missing.";
  } else if (!baseUrl) {
    message = "Payment verification is not configured. Contact support before trying to pay again.";
  } else {
    try {
      const cookie = (await headers()).get("cookie");
      const response = await fetch(`${baseUrl}/verify-payment/${encodeURIComponent(sessionId)}`, {
        method: "POST",
        headers: cookie ? { cookie } : undefined,
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      verified = response.ok && result.premium === true;
      message = verified
        ? "Your premium access is ready. You can now apply for more jobs."
        : result.message || "We could not verify this payment. Please sign in with the account used at checkout and try again.";
    } catch {
      message = "We could not reach the payment verification service. Please try again in a moment.";
    }
  }

  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#18191b] p-8 text-center shadow-xl">
        <div className={`mx-auto mb-5 flex size-16 items-center justify-center rounded-full ${verified ? "bg-green-500/10 text-green-500" : "bg-amber-500/10 text-amber-400"}`} aria-hidden="true">
          {verified ? "✓" : "!"}
        </div>
        <h1 className="text-2xl font-bold text-white">{verified ? "Payment Verified" : "Payment Verification"}</h1>
        <p role={verified ? undefined : "alert"} className="mt-3 text-sm leading-6 text-gray-400">{message}</p>
        <Link href={verified ? "/jobs" : "/pricing"} className="mt-7 inline-block w-full rounded-lg bg-[#068a3f] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#057535]">
          {verified ? "Browse jobs" : "Return to pricing"}
        </Link>
      </div>
    </section>
  );
}
