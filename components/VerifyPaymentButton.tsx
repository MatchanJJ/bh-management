"use client"

import { useState } from "react"
import { verifyPaymentProof } from "@/app/actions/payment-actions"

export default function VerifyPaymentButton({ paymentProofId }: { paymentProofId: string }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleVerify = async () => {
    if (!confirm("Are you sure you want to verify this payment?")) {
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      await verifyPaymentProof(paymentProofId)
      setMessage({ type: "success", text: "Payment verified successfully!" })
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to verify payment" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {message && (
        <div
          className={`mb-2 p-2 rounded text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:bg-green-400"
      >
        {loading ? "Verifying..." : "Verify Payment"}
      </button>
    </div>
  )
}
