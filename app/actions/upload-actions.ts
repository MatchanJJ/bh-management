"use server"

import { requireAuth } from "@/lib/auth-utils"
import { uploadImage } from "@/lib/storage"

export async function uploadMeterPhoto(formData: FormData): Promise<string> {
  const user = await requireAuth()
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB")
  }

  const url = await uploadImage(file, "meter-photos", user.id)
  return url
}

export async function uploadPaymentReceipt(formData: FormData): Promise<string> {
  const user = await requireAuth()
  const file = formData.get("file") as File

  if (!file) {
    throw new Error("No file provided")
  }

  // Validate file type
  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image")
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB")
  }

  const url = await uploadImage(file, "payment-receipts", user.id)
  return url
}
