"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createLandlord(data: {
  name: string
  email: string
  password: string
}) {
  await requireRole([UserRole.ADMIN])

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error("Email already exists")
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10)

  const landlord = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: UserRole.LANDLORD
    }
  })

  revalidatePath("/admin/landlords")

  return {
    id: landlord.id,
    name: landlord.name,
    email: landlord.email,
    role: landlord.role
  }
}

export async function createTenant(data: {
  name: string
  email: string
  password: string
  roomId: string
  billingDueDay: number
}) {
  await requireRole([UserRole.LANDLORD])

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error("Email already exists")
  }

  // Check if room exists and has no tenant
  const room = await prisma.room.findUnique({
    where: { id: data.roomId }
  })

  if (!room) {
    throw new Error("Room not found")
  }

  if (room.tenantId) {
    throw new Error("Room already has a tenant")
  }

  // Hash password
  const passwordHash = await bcrypt.hash(data.password, 10)

  const tenant = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash,
      role: UserRole.TENANT
    }
  })

  // Assign tenant to room with billing due day
  await prisma.room.update({
    where: { id: data.roomId },
    data: { 
      tenant: {
        connect: { id: tenant.id }
      },
      billingDueDay: data.billingDueDay
    }
  })

  revalidatePath("/landlord/tenants")
  revalidatePath("/landlord/rooms")

  return {
    id: tenant.id,
    name: tenant.name,
    email: tenant.email,
    role: tenant.role
  }
}

export async function getAllLandlords() {
  await requireRole([UserRole.ADMIN])

  const landlords = await prisma.user.findMany({
    where: { role: UserRole.LANDLORD },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      _count: {
        select: { roomsOwned: true }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return landlords
}

export async function getAllTenants() {
  const user = await requireRole([UserRole.LANDLORD])

  const tenants = await prisma.user.findMany({
    where: { 
      role: UserRole.TENANT,
      roomTenant: {
        landlordId: user.id
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      roomTenant: {
        select: {
          roomNumber: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return tenants
}
