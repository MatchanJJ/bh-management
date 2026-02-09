"use client"

import { useState } from "react"
import { createRoom } from "@/app/actions/room-actions"

export default function CreateRoomForm() {
  const [roomNumber, setRoomNumber] = useState("")
  const [monthlyRent, setMonthlyRent] = useState("")
  const [wifiFee, setWifiFee] = useState("")
  const [electricityRate, setElectricityRate] = useState("")
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
        electricityRatePerKwh: parseFloat(electricityRate)
      })
      setMessage({ type: "success", text: "Room created successfully!" })
      setRoomNumber("")
      setMonthlyRent("")
      setWifiFee("")
      setElectricityRate("")
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create room" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {message && (
        <div
          className={`p-4 rounded-md ${
            message.type === "success"
              ? "bg-green-50 text-green-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label htmlFor="roomNumber" className="block text-sm font-medium text-gray-700">
            Room Number
          </label>
          <input
            type="text"
            id="roomNumber"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="wifiFee" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="electricityRate" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
      >
        {loading ? "Creating..." : "Create Room"}
      </button>
    </form>
  )
}
