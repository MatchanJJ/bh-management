"use client"

import { useState } from "react"
import { createRoom } from "@/app/actions/room-actions"

export default function CreateRoomForm() {
  const [roomNumber, setRoomNumber] = useState("")
  const [monthlyRent, setMonthlyRent] = useState("")
  const [wifiFee, setWifiFee] = useState("")
  const [electricityRate, setElectricityRate] = useState("")
  const [billingDueDay, setBillingDueDay] = useState("5")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await createRoom({
        roomNumber,
        monthlyRent: parseFloat(monthlyRent),
        wifiFee: parseFloat(wifiFee),
        electricityRatePerKwh: parseFloat(electricityRate),
        billingDueDay: parseInt(billingDueDay)
      })
      setMessage({ type: "success", text: "Room created successfully!" })
      setRoomNumber("")
      setMonthlyRent("")
      setWifiFee("")
      setElectricityRate("")
      setBillingDueDay("5")
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create room" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`rounded-lg border p-4 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label htmlFor="roomNumber" className="text-sm font-medium leading-none">
            Room Number
          </label>
          <input
            type="text"
            id="roomNumber"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="monthlyRent" className="text-sm font-medium leading-none">
            Monthly Rent (₱)
          </label>
          <input
            type="number"
            id="monthlyRent"
            value={monthlyRent}
            onChange={(e) => setMonthlyRent(e.target.value)}
            required
            min="0"
            step="0.01"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="wifiFee" className="text-sm font-medium leading-none">
            WiFi Fee (₱)
          </label>
          <input
            type="number"
            id="wifiFee"
            value={wifiFee}
            onChange={(e) => setWifiFee(e.target.value)}
            required
            min="0"
            step="0.01"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="electricityRate" className="text-sm font-medium leading-none">
            Electricity Rate (₱/kWh)
          </label>
          <input
            type="number"
            id="electricityRate"
            value={electricityRate}
            onChange={(e) => setElectricityRate(e.target.value)}
            required
            min="0"
            step="0.01"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="billingDueDay" className="text-sm font-medium leading-none">
            Billing Due Day
          </label>
          <input
            type="number"
            id="billingDueDay"
            value={billingDueDay}
            onChange={(e) => setBillingDueDay(e.target.value)}
            required
            min="1"
            max="31"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Creating..." : "Create Room"}
        </button>
      </div>
    </form>
  )
}
