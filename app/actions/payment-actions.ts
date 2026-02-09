"use server"

import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/auth-utils"
import { UserRole, PaymentMethod } from "@prisma/client"
import { revalidatePath } from "next/cache"

export async function uploadPaymentProof(data: {
  billingId: string
  paymentMethod: PaymentMethod
  receiptPhotoUrl: string
}) {
  const user = await requireRole([UserRole.TENANT])

  // Verify billing exists and belongs to tenant
  const billing = await prisma.billing.findUnique({
    where: { id: data.billingId },
    include: {
      room: true
    }
  })

  if (!billing || billing.tenantId !== user.id) {
    throw new Error("Billing not found or unauthorized")
  }

  // Create payment proof
  const paymentProof = await prisma.paymentProof.create({
    data: {
      billingId: data.billingId,
      paymentMethod: data.paymentMethod,
      receiptPhotoUrl: data.receiptPhotoUrl,
      uploadedById: user.id
    }
  })

  // Update billing status to PAID
  await prisma.billing.update({
    where: { id: data.billingId },
    data: { status: "PAID" }
  })

  revalidatePath("/tenant/billing")
  revalidatePath("/landlord/billing")
  revalidatePath(`/landlord/billing/${data.billingId}`)

  return paymentProof
}

export async function verifyPaymentProof(paymentProofId: string) {
  const user = await requireRole([UserRole.LANDLORD])

  const paymentProof = await prisma.paymentProof.findUnique({
    where: { id: paymentProofId },
    include: {
      billing: {
        include: {
          room: true
        }
      }
    }
  })

  if (!paymentProof || paymentProof.billing.room.landlordId !== user.id) {
    throw new Error("Payment proof not found or unauthorized")
  }

  if (paymentProof.verifiedById) {
    throw new Error("Payment proof already verified")
  }

  // Update payment proof
  const updated = await prisma.paymentProof.update({
    where: { id: paymentProofId },
    data: {
      verifiedById: user.id,
      verifiedAt: new Date()
    }
  })

  // Update billing status to VERIFIED
  await prisma.billing.update({
    where: { id: paymentProof.billingId },
    data: { status: "VERIFIED" }
  })

  revalidatePath("/landlord/billing")
  revalidatePath("/tenant/billing")
  revalidatePath(`/landlord/billing/${paymentProof.billingId}`)

  return updated
}

export async function getPaymentProofsByBilling(billingId: string) {
  const user = await requireRole([UserRole.LANDLORD, UserRole.TENANT])

  const billing = await prisma.billing.findUnique({
    where: { id: billingId },
    include: {
      room: true
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

  const paymentProofs = await prisma.paymentProof.findMany({
    where: { billingId },
    include: {
      uploadedBy: {
        select: {
          name: true,
          email: true
        }
      },
      verifiedBy: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return paymentProofs
}

export async function getPendingPaymentProofs() {
  const user = await requireRole([UserRole.LANDLORD])

  const paymentProofs = await prisma.paymentProof.findMany({
    where: {
      verifiedById: null,
      billing: {
        room: {
          landlordId: user.id
        }
      }
    },
    include: {
      billing: {
        include: {
          room: {
            select: {
              roomNumber: true
            }
          }
        }
      },
      uploadedBy: {
        select: {
          name: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  })

  return paymentProofs
}

export async function rejectPaymentProof(paymentProofId: string) {
  const user = await requireRole([UserRole.LANDLORD])

  const paymentProof = await prisma.paymentProof.findUnique({
    where: { id: paymentProofId },
    include: {
      billing: {
        include: {
          room: true
        }
      }
    }
  })

  if (!paymentProof || paymentProof.billing.room.landlordId !== user.id) {
    throw new Error("Payment proof not found or unauthorized")
  }

  // Delete payment proof
  await prisma.paymentProof.delete({
    where: { id: paymentProofId }
  })

  // Reset billing status to PENDING if no more payment proofs
  const remainingProofs = await prisma.paymentProof.count({
    where: { billingId: paymentProof.billingId }
  })

  if (remainingProofs === 0) {
    await prisma.billing.update({
      where: { id: paymentProof.billingId },
      data: { status: "PENDING" }
    })
  }

  revalidatePath("/landlord/billing")
  revalidatePath("/tenant/billing")

  return { success: true }
}
