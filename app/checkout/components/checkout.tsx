// app/page.tsx
"use client"; // Mark as client component

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function Home() {
  const [amount, setAmount] = useState(10); // Default amount in dollars
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const stripe = await stripePromise;

    // Call the API route to create a checkout session
    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const { sessionId } = await response.json();

    // Redirect to Stripe Checkout
    if (stripe) {
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error(error.message);
      }
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Buy a Sample Product</h1>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        min="1"
        style={{ marginRight: "10px" }}
      />
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? "Processing..." : `Pay $${amount}`}
      </button>
    </div>
  );
}