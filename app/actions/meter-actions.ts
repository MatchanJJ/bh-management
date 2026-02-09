"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createMeterReading(data: {
  roomId: string
  month: string // Format: YYYY-MM
  currentReading: number
  meterPhotoUrl: string
}) {
  const user = await requireRole([UserRole.LANDLORD])

  // Verify room ownership
  const room = await prisma.room.findUnique({
    where: { id: data.roomId }
  })

  if (!room || room.landlordId !== user.id) {
    throw new Error("Room not found or unauthorized")
  }

  // Check if meter reading for this month already exists
  const existingReading = await prisma.meterReading.findUnique({
    where: {
      roomId_month: {
        roomId: data.roomId,
        month: data.month
      }
    }
  })

  if (existingReading) {
    throw new Error("Meter reading for this month already exists")
  }

  // Get previous reading
  const previousMeterReading = await prisma.meterReading.findFirst({
    where: { roomId: data.roomId },
    orderBy: { month: "desc" }
  })

  const previousReading = previousMeterReading?.currentReading || 0
  const usage = data.currentReading - previousReading

  if (usage < 0) {
    throw new Error("Current reading cannot be less than previous reading")
  }

  // Create meter reading
  const meterReading = await prisma.meterReading.create({
    data: {
      roomId: data.roomId,
      month: data.month,
      currentReading: data.currentReading,
      previousReading,
      usage,
      meterPhotoUrl: data.meterPhotoUrl,
      recordedById: user.id
    }
  })

  // Automatically generate billing if tenant exists
  if (room.tenantId) {
    const electricityAmount = usage * room.electricityRatePerKwh

    await prisma.billing.create({
      data: {
        roomId: data.roomId,
        tenantId: room.tenantId,
        month: data.month,
        rentAmount: room.monthlyRent,
        wifiAmount: room.wifiFee,
        electricityAmount,
        totalAmount: room.monthlyRent + room.wifiFee + electricityAmount,
        status: "PENDING"
      }
    })

    revalidatePath("/tenant/billing")
  }

  revalidatePath("/landlord/meter-readings")
  revalidatePath(`/landlord/rooms/${data.roomId}`)

  return meterReading
}

export async function getMeterReadingsByRoom(roomId: string) {
  const user = await requireRole([UserRole.LANDLORD, UserRole.TENANT])

  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room) {
    throw new Error("Room not found")
  }

  // Check authorization
  if (user.role === UserRole.LANDLORD && room.landlordId !== user.id) {
    throw new Error("Unauthorized")
  }

  if (user.role === UserRole.TENANT && room.tenantId !== user.id) {
    throw new Error("Unauthorized")
  }

  const meterReadings = await prisma.meterReading.findMany({
    where: { roomId },
    include: {
      recordedBy: {
        select: {
          name: true
        }
      }
    },
    orderBy: { month: "desc" }
  })

  return meterReadings
}

export async function getAllMeterReadings() {
  const user = await requireRole([UserRole.LANDLORD])

  const meterReadings = await prisma.meterReading.findMany({
    where: {
      room: {
        landlordId: user.id
      }
    },
    include: {
      room: {
        select: {
          roomNumber: true,
          tenant: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 50
  })

  return meterReadings
}

export async function updateMeterReading(
  meterReadingId: string,
  data: {
    currentReading: number
    meterPhotoUrl?: string
  }
) {
  const user = await requireRole([UserRole.LANDLORD])

  const meterReading = await prisma.meterReading.findUnique({
    where: { id: meterReadingId },
    include: {
      room: true
    }
  })

  if (!meterReading || meterReading.room.landlordId !== user.id) {
    throw new Error("Meter reading not found or unauthorized")
  }

  const usage = data.currentReading - meterReading.previousReading

  if (usage < 0) {
    throw new Error("Current reading cannot be less than previous reading")
  }

  const updated = await prisma.meterReading.update({
    where: { id: meterReadingId },
    data: {
      currentReading: data.currentReading,
      usage,
      ...(data.meterPhotoUrl && { meterPhotoUrl: data.meterPhotoUrl })
    }
  })

  // Update associated billing if exists
  const billing = await prisma.billing.findUnique({
    where: {
      roomId_month: {
        roomId: meterReading.roomId,
        month: meterReading.month
      }
    }
  })

  if (billing) {
    const electricityAmount = usage * meterReading.room.electricityRatePerKwh
    await prisma.billing.update({
      where: { id: billing.id },
      data: {
        electricityAmount,
        totalAmount: billing.rentAmount + billing.wifiAmount + electricityAmount
      }
    })
  }

  revalidatePath("/landlord/meter-readings")
  revalidatePath("/tenant/billing")

  return updated
}
