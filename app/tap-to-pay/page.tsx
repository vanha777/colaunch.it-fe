// app/tap-to-pay/page.tsx
"use client";

import { useState } from "react";
import { loadStripeTerminal } from "@stripe/terminal-js";

// Define types for collectPaymentMethod result
interface PaymentMethodSuccess {
  paymentIntent: any; // Replace 'any' with a more specific type if available
}

interface PaymentMethodError {
  error: {
    message: string;
  };
}

type PaymentMethodResult = PaymentMethodSuccess | PaymentMethodError;

export default function TapToPay() {
  const [amount, setAmount] = useState(10);
  const [status, setStatus] = useState("Ready");
  const [readerList, setReaderList] = useState([]);
  const [selectedReader, setSelectedReader] = useState(null);

  const handleTapToPay = async () => {
    setStatus("Initializing...");
    console.log("debug 0");

    try {
      // Check for NFC support
      if (!("NDEFReader" in window)) {
        throw new Error("This device doesn't support NFC. Use a mobile device with NFC enabled.");
      }

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
          console.log("debug 8.1: Unexpected reader disconnect");
          setStatus("Error: Reader unexpectedly disconnected");
        },
      });
      console.log("debug 9: After StripeTerminal.create", terminal);

      // Discover readers
      setStatus("Discovering readers...");
      const discoverResult = await terminal.discoverReaders({
        simulated: false, // Set to true for testing
      });
      
      console.log("Discovered readers:", discoverResult);
      
      if ('error' in discoverResult) {
        throw new Error(`Reader discovery failed: ${discoverResult.error.message}`);
      }
      
      if ('discoveredReaders' in discoverResult && discoverResult.discoveredReaders.length === 0) {
        throw new Error("No readers found. Please make sure your device is ready.");
      }
      
      // Use the first reader by default
      const reader = discoverResult.discoveredReaders[0];
      setStatus(`Connecting to reader: ${reader.label || 'Unknown device'}...`);
      
      // Connect to the reader
      const connectResult = await terminal.connectReader(reader);
      
      if ('error' in connectResult) {
        throw new Error(`Failed to connect to reader: ${connectResult.error.message}`);
      }
      
      setStatus(`Connected to ${reader.label || 'reader'}. Creating payment...`);

      // Create Payment Intent
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
      const result = (await Promise.race([
        terminal.collectPaymentMethod(clientSecret),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Tap timed out")), 30000)
        ),
      ])) as PaymentMethodResult; // Type assertion
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
      
      // Cleanup - disconnect from reader
      await terminal.disconnectReader();
      setStatus("Payment completed. Ready for next transaction.");
      
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
      console.log("debug 16: Caught error", error);
    }
  };

  const isProcessing = status !== "Ready" && !status.includes("completed") && !status.includes("successful");

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 py-6 px-8">
          <h1 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Tap to Pay
          </h1>
          <p className="text-blue-100 mt-1">Secure payment processing</p>
        </div>
        
        {/* Content */}
        <div className="p-8">
          <div className="mb-6">
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount
            </label>
            <div className="relative mt-1 rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1"
                className="block w-full rounded-md border-gray-300 pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 py-3 text-lg shadow-sm"
                placeholder="0.00"
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <span className="text-gray-500 sm:text-sm">USD</span>
              </div>
            </div>
          </div>

          {/* Amount Card */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Amount:</span>
              <span className="text-xl font-bold text-gray-800">${amount.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Message */}
          {status !== "Ready" && (
            <div className={`mb-6 p-3 rounded-lg ${
              status.includes("Error")
                ? "bg-red-50 text-red-800"
                : status.includes("successful") || status.includes("completed")
                ? "bg-green-50 text-green-800"
                : "bg-blue-50 text-blue-800"
            }`}>
              <div className="flex items-center">
                {status.includes("Error") ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : status.includes("successful") || status.includes("completed") ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {status}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleTapToPay}
            disabled={isProcessing}
            className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
              isProcessing 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            }`}
          >
            {isProcessing ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              "Process Payment"
            )}
          </button>

          {/* Footer */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>Secure payments powered by Stripe Terminal</p>
          </div>
        </div>
      </div>
    </div>
  );
}