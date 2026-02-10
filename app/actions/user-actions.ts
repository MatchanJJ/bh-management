"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"

export async function createLandlord(data: {
  name: string
  email: string
}) {
  await requireRole([UserRole.ADMIN])

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    throw new Error("Email already exists")
  }

  // Create landlord (whitelisted, waiting for Google sign-in)
  const landlord = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: UserRole.LANDLORD,
      isActive: true
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
  roomId: string
  billingDueDay: number
}) {
  await requireRole([UserRole.LANDLORD])

  // Check if email already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email }
  })

  if (existingUser) {
    // If user exists but is inactive, reactivate them
    if (!existingUser.isActive && existingUser.role === UserRole.TENANT) {
      // Assign to new room
      const tenant = await prisma.user.update({
        where: { id: existingUser.id },
        data: { isActive: true }
      })

      await prisma.room.update({
        where: { id: data.roomId },
        data: { 
          tenant: { connect: { id: tenant.id } },
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

  // Create tenant (whitelisted, waiting for Google sign-in)
  const tenant = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: UserRole.TENANT,
      isActive: true
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
      isActive: true,
      createdAt: true,
      roomTenant: {
        select: {
          id: true,
          roomNumber: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return tenants
}

export async function deactivateTenant(tenantId: string) {
  const user = await requireRole([UserRole.LANDLORD])

  // Verify tenant exists and belongs to landlord's rooms
  const tenant = await prisma.user.findFirst({
    where: {
      id: tenantId,
      role: UserRole.TENANT,
      roomTenant: {
        landlordId: user.id
      }
    },
    include: {
      roomTenant: true
    }
  })

  if (!tenant) {
    throw new Error("Tenant not found or unauthorized")
  }

  // Deactivate the tenant (archive)
  await prisma.user.update({
    where: { id: tenantId },
    data: { isActive: false }
  })

  // Remove tenant from room
  if (tenant.roomTenant) {
    await prisma.room.update({
      where: { id: tenant.roomTenant.id },
      data: { tenantId: null }
    })
  }

  revalidatePath("/landlord/tenants")
  revalidatePath("/landlord/rooms")

  return { success: true }
}

export async function reactivateTenant(tenantId: string, roomId: string, billingDueDay: number) {
  const user = await requireRole([UserRole.LANDLORD])

  // Verify tenant exists and is inactive
  const tenant = await prisma.user.findUnique({
    where: { id: tenantId }
  })

  if (!tenant || tenant.isActive) {
    throw new Error("Tenant not found or already active")
  }

  // Check room availability
  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })

  if (!room || room.landlordId !== user.id) {
    throw new Error("Room not found or unauthorized")
  }

  if (room.tenantId) {
    throw new Error("Room already has a tenant")
  }

  // Reactivate tenant
  await prisma.user.update({
    where: { id: tenantId },
    data: { isActive: true }
  })

  // Assign to room
  await prisma.room.update({
    where: { id: roomId },
    data: {
      tenant: { connect: { id: tenantId } },
      billingDueDay
    }
  })

  revalidatePath("/landlord/tenants")
  revalidatePath("/landlord/rooms")

  return { success: true }
}
