// app/api/tap-to-pay/route.ts
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
});

export async function POST(request: Request) {
  const { amount } = await request.json();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // Convert to cents
    currency: "usd",
    payment_method_types: ["card_present"], // For in-person tap payments
    capture_method: "automatic",
  });

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  });
}