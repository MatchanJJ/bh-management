"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function createRoom(data: {
  roomNumber: string
  monthlyRent: number
  wifiFee: number
  electricityRatePerKwh: number
  billingDueDay: number
}) {
  const user = await requireRole([UserRole.LANDLORD])

  // Check if room number already exists for this landlord
  const existingRoom = await prisma.room.findUnique({
    where: {
      landlordId_roomNumber: {
        landlordId: user.id,
        roomNumber: data.roomNumber
      }
    }
  })

  if (existingRoom) {
    throw new Error("Room number already exists")
  }

  const room = await prisma.room.create({
    data: {
      roomNumber: data.roomNumber,
      monthlyRent: data.monthlyRent,
      wifiFee: data.wifiFee,
      electricityRatePerKwh: data.electricityRatePerKwh,
      billingDueDay: data.billingDueDay,
      landlordId: user.id
    }
  })

  revalidatePath("/landlord/rooms")

  return room
}

export async function updateRoom(roomId: string, data: {
  monthlyRent?: number
  wifiFee?: number
  electricityRatePerKwh?: number
  billingDueDay?: number
}) {
  const user = await requireRole([UserRole.LANDLORD])

  // Verify ownership
  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room || room.landlordId !== user.id) {
    throw new Error("Room not found or unauthorized")
  }

  const updatedRoom = await prisma.room.update({
    where: { id: roomId },
    data
  })

  revalidatePath("/landlord/rooms")

  return updatedRoom
}

export async function getRoomsByLandlord() {
  const user = await requireRole([UserRole.LANDLORD])

  const rooms = await prisma.room.findMany({
    where: { landlordId: user.id },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      _count: {
        select: { 
          meterReadings: true,
          billings: true
        }
      }
    },
    orderBy: { roomNumber: "asc" }
  })

  return rooms
}

export async function getRoomById(roomId: string) {
  const user = await requireRole([UserRole.LANDLORD, UserRole.TENANT])

  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      tenant: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      landlord: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
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

  return room
}

export async function removeTenantFromRoom(roomId: string) {
  const user = await requireRole([UserRole.LANDLORD])

  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room || room.landlordId !== user.id) {
    throw new Error("Room not found or unauthorized")
  }

  await prisma.room.update({
    where: { id: roomId },
    data: { tenantId: null }
  })

  revalidatePath("/landlord/rooms")
}
