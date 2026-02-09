"use client"

import { useState } from "react"
import { createMeterReading } from "@/app/actions/meter-actions"
import { uploadMeterPhoto } from "@/app/actions/upload-actions"

type Room = {
  id: string
  roomNumber: string
  tenantId: string | null
}

export default function CreateMeterReadingForm({ rooms }: { rooms: Room[] }) {
  const [roomId, setRoomId] = useState("")
  const [month, setMonth] = useState("")
  const [currentReading, setCurrentReading] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setMessage({ type: "error", text: "Please select a meter photo" })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      // Upload photo first
      const formData = new FormData()
      formData.append("file", file)
      const meterPhotoUrl = await uploadMeterPhoto(formData)

      // Create meter reading
      await createMeterReading({
        roomId,
        month,
        currentReading: parseFloat(currentReading),
        meterPhotoUrl
      })

      setMessage({ type: "success", text: "Meter reading recorded and billing generated!" })
      setRoomId("")
      setMonth("")
      setCurrentReading("")
      setFile(null)
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Failed to record meter reading" })
    } finally {
      setLoading(false)
    }
  }

  // Get current month in YYYY-MM format
  const getCurrentMonth = () => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
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
          <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">
            Room
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
                {room.roomNumber} {room.tenantId ? "" : "(Vacant)"}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="month" className="block text-sm font-medium text-gray-700">
            Month (YYYY-MM)
          </label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            max={getCurrentMonth()}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="currentReading" className="block text-sm font-medium text-gray-700">
            Current Reading (kWh)
          </label>
          <input
            type="number"
            id="currentReading"
            value={currentReading}
            onChange={(e) => setCurrentReading(e.target.value)}
            required
            min="0"
            step="0.01"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label htmlFor="meterPhoto" className="block text-sm font-medium text-gray-700">
            Meter Photo
          </label>
          <input
            type="file"
            id="meterPhoto"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition disabled:bg-indigo-400"
      >
        {loading ? "Recording..." : "Record Meter Reading"}
      </button>
    </form>
  )
}
