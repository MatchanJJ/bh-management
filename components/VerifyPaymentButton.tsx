"use client"

import { useState } from "react"
import { verifyPaymentProof } from "@/app/actions/payment-actions"

export default function VerifyPaymentButton({ paymentProofId }: { paymentProofId: string }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleVerify = async () => {
    setLoading(true)
    setMessage(null)

    try {
      await verifyPaymentProof(paymentProofId)
      setMessage({ type: "success", text: "Payment verified successfully!" })
      setTimeout(() => {
        setShowModal(false)
        setMessage(null)
      }, 2000)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to verify payment" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition"
      >
        Verify Payment
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-lg shadow-lg w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Verify Payment</h3>
              <p className="text-sm text-muted-foreground">
                Are you sure you want to verify this payment? This action will mark the payment as verified.
              </p>
            </div>

            {message && (
              <div
                className={`mb-4 p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleVerify}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify Payment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
