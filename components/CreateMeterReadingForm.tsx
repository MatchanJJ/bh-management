"use client"

import { useState, useEffect } from "react"
import { createMeterReading, getLastMeterReading } from "@/app/actions/meter-actions"
import { uploadMeterPhoto } from "@/app/actions/upload-actions"

type Room = {
  id: string
  roomNumber: string
  tenantId: string | null
}

export default function CreateMeterReadingForm({ rooms }: { rooms: Room[] }) {
  const [roomId, setRoomId] = useState("")
  const [month, setMonth] = useState("")
  const [previousReading, setPreviousReading] = useState("")
  const [currentReading, setCurrentReading] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [isFirstReading, setIsFirstReading] = useState(false)
  const [fetchingPrevious, setFetchingPrevious] = useState(false)

  // Fetch previous reading when room is selected
  useEffect(() => {
    if (roomId) {
      setFetchingPrevious(true)
      getLastMeterReading(roomId)
        .then((lastReading) => {
          if (lastReading) {
            setPreviousReading(lastReading.currentReading.toString())
            setIsFirstReading(false)
          } else {
            setPreviousReading("0")
            setIsFirstReading(true)
          }
        })
        .catch(() => {
          setPreviousReading("0")
          setIsFirstReading(true)
        })
        .finally(() => {
          setFetchingPrevious(false)
        })
    }
  }, [roomId])

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
        previousReading: parseFloat(previousReading),
        currentReading: parseFloat(currentReading),
        meterPhotoUrl
      })

      setMessage({ type: "success", text: "Meter reading recorded and billing generated!" })
      setRoomId("")
      setMonth("")
      setPreviousReading("")
      setCurrentReading("")
      setFile(null)
      setIsFirstReading(false)
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                {room.roomNumber} {room.tenantId ? "" : "(Vacant)"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="month" className="text-sm font-medium leading-none">
            Month
          </label>
          <input
            type="month"
            id="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            max={getCurrentMonth()}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="previousReading" className="text-sm font-medium leading-none">
            Previous (kWh)
            {isFirstReading && <span className="text-xs text-muted-foreground ml-1">(editable)</span>}
          </label>
          <input
            type="number"
            id="previousReading"
            value={previousReading}
            onChange={(e) => setPreviousReading(e.target.value)}
            required
            min="0"
            step="0.01"
            disabled={!isFirstReading || fetchingPrevious}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="currentReading" className="text-sm font-medium leading-none">
            Current (kWh)
          </label>
          <input
            type="number"
            id="currentReading"
            value={currentReading}
            onChange={(e) => setCurrentReading(e.target.value)}
            required
            min="0"
            step="0.01"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="meterPhoto" className="text-sm font-medium leading-none">
            Photo
          </label>
          <input
            type="file"
            id="meterPhoto"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-1 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Recording..." : "Record Meter Reading"}
        </button>
      </div>
    </form>
  )
}
