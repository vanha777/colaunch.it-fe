import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

export async function POST() {
  console.log("check here 1");
  const connectionToken = await stripe.terminal.connectionTokens.create();
  console.log("check here 2");
  return NextResponse.json({ secret: connectionToken.secret });
}