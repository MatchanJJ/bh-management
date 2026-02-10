"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole, BillingStatus } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function getBillingsByTenant() {
  const user = await requireRole([UserRole.TENANT])

  const billings = await prisma.billing.findMany({
    where: { tenantId: user.id },
    include: {
      room: {
        select: {
          roomNumber: true,
          billingDueDay: true,
          electricityRatePerKwh: true,
          meterReadings: {
            where: {
              month: undefined // Will be filtered per billing
            },
            select: {
              previousReading: true,
              currentReading: true,
              usage: true
            }
          },
          landlord: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      paymentProofs: {
        select: {
          id: true,
          paymentMethod: true,
          createdAt: true,
          verifiedAt: true
        }
      }
    },
    orderBy: { month: "desc" }
  })

  // Add meter reading for each billing's month
  const billingsWithMeterReadings = await Promise.all(
    billings.map(async (billing) => {
      const meterReading = await prisma.meterReading.findUnique({
        where: {
          roomId_month: {
            roomId: billing.roomId,
            month: billing.month
          }
        },
        select: {
          previousReading: true,
          currentReading: true,
          usage: true
        }
      })

      return {
        ...billing,
        meterReading
      }
    })
  )

  return billingsWithMeterReadings
}

export async function getBillingsByLandlord() {
  const user = await requireRole([UserRole.LANDLORD])

  const billings = await prisma.billing.findMany({
    where: {
      room: {
        landlordId: user.id
      }
    },
    include: {
      room: {
        select: {
          roomNumber: true,
          billingDueDay: true
        }
      },
      paymentProofs: {
        select: {
          id: true,
          paymentMethod: true,
          receiptPhotoUrl: true,
          createdAt: true,
          verifiedAt: true,
          uploadedBy: {
            select: {
              name: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return billings
}

export async function getBillingById(billingId: string) {
  const user = await requireRole([UserRole.LANDLORD, UserRole.TENANT])

  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
    include: {
      room: {
        include: {
          landlord: {
            select: {
              name: true,
              email: true
            }
          }
        }
      },
      paymentProofs: {
        include: {
          uploadedBy: {
            select: {
              name: true
            }
          },
          verifiedBy: {
            select: {
              name: true
            }
          }
        }
      }
    }
  })

  if (!billing) {
    throw new Error("Billing not found")
  }

  // Check authorization
  if (user.role === UserRole.LANDLORD && billing.room.landlordId !== user.id) {
    throw new Error("Unauthorized")
  }

  if (user.role === UserRole.TENANT && billing.tenantId !== user.id) {
    throw new Error("Unauthorized")
  }

  return billing
}

export async function createManualBilling(data: {
  roomId: string
  month: string
  rentAmount?: number
  wifiAmount?: number
  electricityAmount?: number
}) {
  const user = await requireRole([UserRole.LANDLORD])

  const room = await prisma.room.findUnique({
    where: { id: data.roomId }
  })

  if (!room || room.landlordId !== user.id) {
    throw new Error("Room not found or unauthorized")
  }

  if (!room.tenantId) {
    throw new Error("Room has no tenant")
  }

  // Check if billing already exists
  const existingBilling = await prisma.billing.findUnique({
    where: {
      roomId_month: {
        roomId: data.roomId,
        month: data.month
      }
    }
  })

  if (existingBilling) {
    throw new Error("Billing for this month already exists")
  }

  const rentAmount = data.rentAmount ?? room.monthlyRent
  const wifiAmount = data.wifiAmount ?? room.wifiFee
  const electricityAmount = data.electricityAmount ?? 0

  const billing = await prisma.billing.create({
    data: {
      roomId: data.roomId,
      tenantId: room.tenantId,
      month: data.month,
      rentAmount,
      wifiAmount,
      electricityAmount,
      totalAmount: rentAmount + wifiAmount + electricityAmount,
      status: "PENDING"
    }
  })

  revalidatePath("/landlord/billing")
  revalidatePath("/tenant/billing")

  return billing
}

export async function getPendingBillingsByLandlord() {
  const user = await requireRole([UserRole.LANDLORD])

  const count = await prisma.billing.count({
    where: {
      room: {
        landlordId: user.id
      },
      status: BillingStatus.PENDING
    }
  })

  return count
}

export async function getPendingBillingsByTenant() {
  const user = await requireRole([UserRole.TENANT])

  const count = await prisma.billing.count({
    where: {
      tenantId: user.id,
      status: BillingStatus.PENDING
    }
  })

  return count
}
