import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { db } from "@/lib/mongodb";

const PREMIUM_PRICE_ID = process.env.STRIPE_PREMIUM_PRICE_ID || "price_1UbGcDGs6plR5djCifc4C1JJ";

function getUserFilter(userId: string) {
  if (!ObjectId.isValid(userId)) throw new Error("The signed-in user ID is invalid.");
  return { _id: new ObjectId(userId) };
}

export async function POST() {
  let stage = "initializing checkout";
  try {
    const requestHeaders = await headers();
    const siteOrigin = process.env.BETTER_AUTH_URL
      ? new URL(process.env.BETTER_AUTH_URL).origin
      : null;
    const requestOrigin = requestHeaders.get("origin");
    if (siteOrigin && requestOrigin && requestOrigin !== siteOrigin) {
      return NextResponse.json({ error: "Invalid checkout request origin." }, { status: 403 });
    }
    stage = "checking sign-in session";
    const userSession = await auth.api.getSession({ headers: requestHeaders });

    if (!userSession?.user) {
      if (!siteOrigin) return NextResponse.json({ error: "Sign in before checking out." }, { status: 401 });
      return NextResponse.redirect(`${siteOrigin}/sign-in?callbackURL=%2Fpricing`, 303);
    }

    if (userSession.user.role !== "jobSeeker") {
      return NextResponse.json({ error: "Only job seekers can purchase premium." }, { status: 403 });
    }

    const userId = userSession.user.id;
    const userFilter = getUserFilter(userId);
    stage = "looking up the account and payment record";
    const users = db.collection("user");
    const user = await users.findOne(userFilter);
    const existingPayment = await db.collection("payments").findOne({ userId, status: "paid" });

    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    if (user.premium === true || existingPayment) {
      if (!siteOrigin) return NextResponse.json({ error: "Site URL is not configured." }, { status: 500 });
      return NextResponse.redirect(`${siteOrigin}/pricing?alreadyPremium=1`, 303);
    }

    if (!siteOrigin) return NextResponse.json({ error: "Site URL is not configured." }, { status: 500 });

    // Reuse the user's open session. Stable idempotency keys also collapse concurrent requests.
    let idempotencyKey = `premium-checkout-${userId}-initial`;
    if (typeof user.pendingCheckoutSessionId === "string") {
      stage = "checking the existing checkout session";
      idempotencyKey = `premium-checkout-${userId}-${user.pendingCheckoutSessionId}`;
      try {
        const pendingSession = await stripe.checkout.sessions.retrieve(user.pendingCheckoutSessionId);
        if (pendingSession.status === "open" && pendingSession.url) {
          return NextResponse.redirect(pendingSession.url, 303);
        }
        if (pendingSession.status === "complete") {
          return NextResponse.redirect(
            `${siteOrigin}/pricing/success?session_id=${encodeURIComponent(pendingSession.id)}`,
            303,
          );
        }
      } catch (error) {
        console.error("Could not retrieve the pending Checkout Session:", error);
        return NextResponse.json({ error: "Could not check your existing checkout session." }, { status: 502 });
      }
    }

    stage = "creating the Stripe Checkout Session";
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [{ price: PREMIUM_PRICE_ID, quantity: 1 }],
        mode: "payment",
        customer_email: userSession.user.email,
        client_reference_id: userId,
        metadata: { userId, purpose: "premium-one-time" },
        success_url: `${siteOrigin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteOrigin}/pricing?canceled=1`,
      },
      { idempotencyKey },
    );

    if (!session.url) {
      return NextResponse.json({ error: "Checkout Session URL is unavailable." }, { status: 500 });
    }

    stage = "saving the pending checkout session";
    await users.updateOne(userFilter, {
      $set: { pendingCheckoutSessionId: session.id },
    });

    return NextResponse.redirect(session.url, 303);
  } catch (error) {
    console.error("Checkout creation failed:", error);
    const details = error instanceof Error ? error.message : "Unexpected checkout error.";
    return NextResponse.json({
      error: "Could not start checkout.",
      ...(process.env.NODE_ENV !== "production" ? { details, stage } : {}),
    }, { status: 500 });
  }
}
