"use client"

import { useState } from "react"
import { uploadPaymentReceipt } from "@/app/actions/upload-actions"
import { uploadPaymentProof } from "@/app/actions/payment-actions"
import { PaymentMethod } from "@prisma/client"

export default function UploadPaymentProofButton({ billingId }: { billingId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH)
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setMessage(null)

    try {
      // Upload image first
      const formData = new FormData()
      formData.append("file", file)
      const receiptPhotoUrl = await uploadPaymentReceipt(formData)

      // Create payment proof
      await uploadPaymentProof({
        billingId,
        paymentMethod,
        receiptPhotoUrl
      })

      setMessage({ type: "success", text: "Payment proof uploaded successfully!" })
      setShowForm(false)
      setFile(null)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to upload payment proof" })
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
      >
        Upload Payment Proof
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-3 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Payment Method
        </label>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
          className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value={PaymentMethod.CASH}>Cash</option>
          <option value={PaymentMethod.ONLINE}>Online (GCash/Bank)</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Receipt Photo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        <p className="text-xs text-gray-500 mt-1">Max 5MB, image only</p>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
        >
          {loading ? "Uploading..." : "Submit Payment Proof"}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowForm(false)
            setMessage(null)
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
