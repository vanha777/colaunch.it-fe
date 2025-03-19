// app/tap-to-pay/page.tsx
"use client";

import { useState } from "react";
import { loadStripeTerminal } from "@stripe/terminal-js";

export default function TapToPay() {
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState("Ready");

  const handleTapToPay = async () => {
    setStatus("Initializing...");
    console.log("debug 0");

    try {
      // Load Stripe Terminal
      console.log("debug 1: Before loadStripeTerminal");
      const StripeTerminal = await loadStripeTerminal();
      console.log("debug 2: After loadStripeTerminal", StripeTerminal);

      if (!StripeTerminal) {
        setStatus("Stripe Terminal failed to load");
        console.log("debug 3: StripeTerminal is null");
        return;
      }

      console.log("debug 4: Before StripeTerminal.create");
      const terminal = StripeTerminal.create({
        onFetchConnectionToken: async () => {
          console.log("debug 5: Inside onFetchConnectionToken");
          const response = await fetch("/api/connection-token", {
            method: "POST",
          });
          console.log("debug 6: After fetch", response);
          if (!response.ok) {
            throw new Error(`Fetch failed: ${response.status}`);
          }
          const { secret } = await response.json();
          console.log("debug 7: Connection token", secret);
          return secret;
        },
        onConnectionStatusChange: (e) => {
          console.log("debug 8: Status change", e.status);
          setStatus(`Status: ${e.status}`);
        },
        onUnexpectedReaderDisconnect: () => {
          console.log(" extrac debug 8.1: Unexpected reader disconnect");
          setStatus("Error: Reader unexpectedly disconnected");
        },
      });
      console.log("debug 9: After StripeTerminal.create", terminal);

      // Create Payment Intent
      setStatus("Creating payment intent...");
      console.log("debug 10: Before fetch /api/tap-to-pay");
      const response = await fetch("/api/tap-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (!response.ok) {
        throw new Error(`Payment intent fetch failed: ${response.status}`);
      }
      const { clientSecret } = await response.json();
      console.log("debug 11: Client secret", clientSecret);

      // Collect payment
      setStatus("Tap your phone now...");
      console.log("debug 12: Before collectPaymentMethod");
      const result = await terminal.collectPaymentMethod(clientSecret);
      console.log("debug 13: After collectPaymentMethod", result);

      if ("error" in result) {
        setStatus(`Error: ${result.error.message}`);
      } else {
        console.log("debug 14: Before processPayment");
        const confirmed = await terminal.processPayment(result.paymentIntent);
        console.log("debug 15: After processPayment", confirmed);
        if ("paymentIntent" in confirmed && confirmed.paymentIntent.status === "succeeded") {
          setStatus("Payment successful!");
        } else {
          setStatus("Payment failed");
        }
      }
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
      console.log("debug 16: Caught error", error);
    }
  };

  const isProcessing = status !== "Ready" && status !== "Payment successful!";

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
        disabled={isProcessing}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isProcessing ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {status}
      </button>
      {status !== "Ready" && (
        <div
          className={`mt-4 text-sm ${
            status.includes("Error")
              ? "text-red-600"
              : status.includes("successful")
              ? "text-green-600"
              : "text-blue-600"
          }`}
        >
          {status}
        </div>
      )}
    </div>
  );
}