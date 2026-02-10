"use client"

import { useState } from "react"
import { createTenant } from "@/app/actions/user-actions"

type Room = {
  id: string
  roomNumber: string
}

export default function CreateTenantForm({ rooms }: { rooms: Room[] }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [roomId, setRoomId] = useState("")
  const [billingDueDay, setBillingDueDay] = useState("5")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await createTenant({ name, email, password, roomId, billingDueDay: parseInt(billingDueDay) })
      setMessage({ type: "success", text: "Tenant created successfully!" })
      setName("")
      setEmail("")
      setPassword("")
      setRoomId("")
      setBillingDueDay("5")
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to create tenant" })
    } finally {
      setLoading(false)
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No vacant rooms available. Please create rooms first or remove tenants from existing rooms.
      </div>
    )
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

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
            Assign to Room
          </label>
          <select
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomNumber}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="billingDueDay" className="block text-sm font-medium text-gray-700">
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
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-gray-500">Day of month (1-31)</p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
      >
        {loading ? "Creating..." : "Create Tenant"}
      </button>
    </form>
  )
}
