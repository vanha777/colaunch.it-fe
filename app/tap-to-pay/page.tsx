// app/tap-to-pay/page.tsx
"use client";

import { useState } from "react";
import { loadStripeTerminal } from "@stripe/terminal-js";

export default function TapToPay() {
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState("Ready");

  const handleTapToPay = async () => {
    setStatus("Initializing...");

    // Load Stripe Terminal
    const Terminal = await loadStripeTerminal();
    if (!Terminal) {
      setStatus("Terminal failed to load");
      return;
    }

    const terminal = Terminal.create({
      onFetchConnectionToken: async () => {
        const response = await fetch("/api/connection-token", {
          method: "POST",
        });
        const { secret } = await response.json();
        return secret;
      },
      onConnectionStatusChange: (e) => setStatus(`Status: ${e.status}`),
    });

    // Create Payment Intent
    const response = await fetch("/api/tap-to-pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const { clientSecret } = await response.json();

    // Collect payment
    setStatus("Tap your phone now...");
    const result = await terminal.collectPaymentMethod(clientSecret);

    if ('error' in result) {
      setStatus(`Error: ${result.error.message}`);
    } else {
      const confirmed = await terminal.processPayment(result.paymentIntent);
      if ('paymentIntent' in confirmed && confirmed.paymentIntent.status === "succeeded") {
        setStatus("Payment successful!");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Tap to Pay</h1>
      
      <div className="mb-4">
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
          Amount ($)
        </label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="1"
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
      
      <button 
        onClick={handleTapToPay} 
        disabled={status.includes("Processing")}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          status.includes("Processing") 
            ? "bg-gray-400 cursor-not-allowed" 
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {status}
      </button>
      
      {status !== "Ready" && (
        <div className={`mt-4 text-sm ${
          status.includes("Error") 
            ? "text-red-600" 
            : status.includes("successful") 
              ? "text-green-600" 
              : "text-blue-600"
        }`}>
          {status}
        </div>
      )}
    </div>
  );
}