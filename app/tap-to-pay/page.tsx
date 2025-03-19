// app/tap-to-pay/page.tsx
"use client";

import { useState } from "react";
import { loadStripeTerminal } from "@stripe/terminal-js";

// Define types for collectPaymentMethod result
interface PaymentMethodSuccess {
  paymentIntent: any;
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

  const handleTapToPay = async () => {
    setStatus("Initializing...");

    try {
      // Load Stripe Terminal
      const StripeTerminal = await loadStripeTerminal();
      
      if (!StripeTerminal) {
        setStatus("Stripe Terminal failed to load");
        return;
      }

      // Initialize the terminal with simulated=true for mobile browser
      const terminal = StripeTerminal.create({
        onFetchConnectionToken: async () => {
          const response = await fetch("/api/connection-token", {
            method: "POST",
          });
          if (!response.ok) {
            throw new Error(`Failed to fetch connection token: ${response.status}`);
          }
          const { secret } = await response.json();
          return secret;
        },
        onConnectionStatusChange: (e) => {
          setStatus(`Connection status: ${e.status}`);
        },
        onUnexpectedReaderDisconnect: () => {
          setStatus("Error: Reader unexpectedly disconnected");
          console.error("Reader disconnected unexpectedly");
        }
      });

      // For phone-based Tap to Pay, we use the simulated reader
      setStatus("Setting up mobile Tap to Pay...");
      
      // Initialize the payment flow
      await terminal.setSimulatorConfiguration({
        testCardNumber: '4242424242424242',
      });
      
      // Try to connect to a reader
      setStatus("Connecting to reader...");
      
      // First discover readers (in test mode, this will create a simulated reader)
      const discoverResult = await terminal.discoverReaders({ simulated: true });
      
      if ('error' in discoverResult) {
        throw new Error(`Reader discovery failed: ${discoverResult.error.message}`);
      }
      
      // Connect to the first reader (simulated in test mode)
      if (discoverResult.discoveredReaders.length === 0) {
        throw new Error("No readers found. Please ensure simulator is enabled.");
      }
      
      const connectResult = await terminal.connectReader(discoverResult.discoveredReaders[0]);
      
      if ('error' in connectResult) {
        throw new Error(`Failed to connect to reader: ${connectResult.error.message}`);
      }
      
      setStatus("Reader connected. Creating payment...");
      
      // Create Payment Intent
      setStatus("Creating payment intent...");
      const response = await fetch("/api/tap-to-pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create payment intent: ${response.status}`);
      }
      
      const { clientSecret } = await response.json();

      // Collect payment using collectPaymentMethod (not collectInputMethod)
      setStatus("Ready to tap. Hold card near phone...");
      
      // Start payment collection
      const result = await terminal.collectPaymentMethod(clientSecret);

      if ('error' in result) {
        setStatus(`Error: ${result.error.message}`);
        return;
      }

      setStatus("Processing payment...");
      const processResult = await terminal.processPayment(result.paymentIntent);
      
      if ('error' in processResult) {
        setStatus(`Processing error: ${processResult.error.message}`);
      } else if (processResult.paymentIntent && processResult.paymentIntent.status === "succeeded") {
        setStatus("Payment successful!");
      } else if ('paymentIntent' in processResult) {
        setStatus(`Payment status: ${processResult.paymentIntent.status}`);
      }
      
      // Disconnect the reader
      await terminal.disconnectReader();
      
    } catch (error) {
      console.error("Payment error:", error);
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    }
  };

  const isProcessing = status !== "Ready" && !status.includes("successful");

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
          <p className="text-blue-100 mt-1">Accept payments using your device</p>
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
                : status.includes("successful")
                ? "bg-green-50 text-green-800"
                : "bg-blue-50 text-blue-800"
            }`}>
              <div className="flex items-center">
                {status.includes("Error") ? (
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : status.includes("successful") ? (
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
              "Accept Payment"
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