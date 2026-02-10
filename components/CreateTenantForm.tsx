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
  const [roomId, setRoomId] = useState("")
  const [billingDueDay, setBillingDueDay] = useState("5")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await createTenant({ name, email, roomId, billingDueDay: parseInt(billingDueDay) })
      setMessage({ type: "success", text: "Tenant whitelisted! They can now sign in with their Google account." })
      setName("")
      setEmail("")
      setRoomId("")
      setBillingDueDay("5")
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to whitelist tenant" })
    } finally {
      setLoading(false)
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="text-sm text-muted-foreground rounded-lg border border-dashed p-4 text-center">
        No vacant rooms available. Please create rooms first or remove tenants from existing rooms.
      </div>
    )
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium leading-none">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium leading-none">
            Google Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="user@gmail.com"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="roomId" className="text-sm font-medium leading-none">
            Room
          </label>
          <select
            id="roomId"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Select room</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.roomNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="billingDueDay" className="text-sm font-medium leading-none">
            Due Day
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
          <p className="text-xs text-muted-foreground">Day of month (1-31)</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Whitelisting..." : "Whitelist Tenant"}
        </button>
      </div>
    </form>
  )
}
