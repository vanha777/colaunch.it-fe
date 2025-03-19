"use client"; // Mark as client component

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

// Initialize Stripe with the publishable key
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

export default function CheckoutPage() {
  const [amount, setAmount] = useState(10); // Default amount in dollars
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    try {
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
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-md py-12">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
            Amount (USD)
          </label>
          <div className="mt-1 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">$</span>
            </div>
            <input
              type="number"
              id="amount"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              min="1"
            />
          </div>
        </div>
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay $${amount}`}
        </button>
      </div>
    </div>
  );
}
