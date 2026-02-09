# 📚 Server Actions API Reference

Complete reference for all Server Actions in the BH Management System.

## 🔐 Authentication

All actions automatically verify user authentication and roles. Unauthorized access throws an error.

---

## 👤 User Actions (`app/actions/user-actions.ts`)

### `createLandlord(data)`
**Role**: Admin only

Creates a new landlord account.

```typescript
await createLandlord({
  name: "John Doe",
  email: "john@example.com",
  password: "securepassword"
})
```

### `createTenant(data)`
**Role**: Landlord only

Creates a new tenant and assigns to a room.

```typescript
await createTenant({
  name: "Jane Smith",
  email: "jane@example.com",
  password: "securepassword",
  roomId: "room-id-here"
})
```

### `getAllLandlords()`
**Role**: Admin only

Returns all landlord accounts with room counts.

### `getAllTenants()`
**Role**: Landlord only

Returns all tenants belonging to the landlord's rooms.

---

## 🏠 Room Actions (`app/actions/room-actions.ts`)

### `createRoom(data)`
**Role**: Landlord only

Creates a new rental room.

```typescript
await createRoom({
  roomNumber: "101",
  monthlyRent: 5000,
  wifiFee: 500,
  electricityRatePerKwh: 12.5
})
```

### `updateRoom(roomId, data)`
**Role**: Landlord only

Updates room pricing.

```typescript
await updateRoom("room-id", {
  monthlyRent: 5500,
  wifiFee: 600
})
```

### `getRoomsByLandlord()`
**Role**: Landlord only

Returns all rooms owned by the landlord with tenant info.

### `getRoomById(roomId)`
**Role**: Landlord or Tenant

Returns room details. Access restricted to owner or assigned tenant.

### `removeTenantFromRoom(roomId)`
**Role**: Landlord only

Removes tenant assignment from a room.

---

## ⚡ Meter Reading Actions (`app/actions/meter-actions.ts`)

### `createMeterReading(data)`
**Role**: Landlord only

Records a meter reading and auto-generates billing.

```typescript
await createMeterReading({
  roomId: "room-id",
  month: "2026-02",
  currentReading: 1250.5,
  meterPhotoUrl: "https://storage.url/photo.jpg"
})
```

**Important**: 
- Automatically fetches previous reading
- Calculates usage
- Generates billing if tenant exists

### `getMeterReadingsByRoom(roomId)`
**Role**: Landlord or Tenant

Returns all meter readings for a specific room.

### `getAllMeterReadings()`
**Role**: Landlord only

Returns recent meter readings across all landlord's rooms.

### `updateMeterReading(meterReadingId, data)`
**Role**: Landlord only

Updates an existing meter reading and recalculates billing.

---

## 💰 Billing Actions (`app/actions/billing-actions.ts`)

### `getBillingsByTenant()`
**Role**: Tenant only

Returns all billing records for the tenant.

### `getBillingsByLandlord()`
**Role**: Landlord only

Returns all billing records for landlord's rooms.

### `getBillingById(billingId)`
**Role**: Landlord or Tenant

Returns detailed billing info including payment proofs.

### `createManualBilling(data)`
**Role**: Landlord only

Manually creates a billing record (use when no meter reading).

```typescript
await createManualBilling({
  roomId: "room-id",
  month: "2026-02",
  rentAmount: 5000,
  wifiAmount: 500,
  electricityAmount: 750
})
```

### `getPendingBillingsByLandlord()`
**Role**: Landlord only

Returns count of pending billings.

### `getPendingBillingsByTenant()`
**Role**: Tenant only

Returns count of pending billings.

---

## 💳 Payment Actions (`app/actions/payment-actions.ts`)

### `uploadPaymentProof(data)`
**Role**: Tenant only

Uploads payment proof and marks billing as PAID.

```typescript
await uploadPaymentProof({
  billingId: "billing-id",
  paymentMethod: "CASH", // or "ONLINE"
  receiptPhotoUrl: "https://storage.url/receipt.jpg"
})
```

### `verifyPaymentProof(paymentProofId)`
**Role**: Landlord only

Verifies payment and marks billing as VERIFIED.

```typescript
await verifyPaymentProof("payment-proof-id")
```

### `getPaymentProofsByBilling(billingId)`
**Role**: Landlord or Tenant

Returns all payment proofs for a billing record.

### `getPendingPaymentProofs()`
**Role**: Landlord only

Returns all unverified payment proofs.

### `rejectPaymentProof(paymentProofId)`
**Role**: Landlord only

Deletes a payment proof and resets billing to PENDING.

---

## 📤 Upload Actions (`app/actions/upload-actions.ts`)

### `uploadMeterPhoto(formData)`
**Role**: Authenticated users

Uploads meter photo to Supabase Storage.

```typescript
const formData = new FormData()
formData.append("file", file)
const url = await uploadMeterPhoto(formData)
```

### `uploadPaymentReceipt(formData)`
**Role**: Authenticated users

Uploads payment receipt to Supabase Storage.

---

## 🔒 Auth Utilities (`lib/auth-utils.ts`)

### `getCurrentUser()`
Returns current authenticated user or null.

### `requireAuth()`
Returns current user or throws error if not authenticated.

### `requireRole(roles)`
Returns current user or throws error if role not in allowed list.

```typescript
await requireRole([UserRole.ADMIN, UserRole.LANDLORD])
```

---

## 📊 Enums

### UserRole
```typescript
enum UserRole {
  ADMIN
  LANDLORD
  TENANT
}
```

### BillingStatus
```typescript
enum BillingStatus {
  PENDING   // Not yet paid
  PAID      // Payment proof uploaded
  VERIFIED  // Verified by landlord
}
```

### PaymentMethod
```typescript
enum PaymentMethod {
  CASH
  ONLINE
}
```

---

## ⚠️ Error Handling

All actions throw errors with descriptive messages:

```typescript
try {
  await createRoom(data)
} catch (error) {
  console.error(error.message)
  // "Room number already exists"
  // "Unauthorized"
  // etc.
}
```

Common errors:
- `"Unauthorized"` - No session or wrong role
- `"Forbidden"` - Has session but insufficient permissions
- `"Not found"` - Resource doesn't exist
- `"Already exists"` - Duplicate entry

---

## 🔄 Revalidation

Actions automatically revalidate relevant pages using `revalidatePath()`:

- Creating room → revalidates `/landlord/rooms`
- Recording meter → revalidates `/landlord/meter-readings` and `/tenant/billing`
- Uploading payment → revalidates billing pages

This ensures UI stays in sync with database changes.

---

## 💡 Best Practices

1. **Always handle errors** - Use try/catch blocks
2. **Validate inputs** - Check data before submission
3. **Use TypeScript** - Leverage type safety
4. **Check permissions client-side** - Hide actions user can't perform
5. **Provide feedback** - Show success/error messages to users

---

## 📖 Example Usage in Components

```typescript
"use client"

import { createRoom } from "@/app/actions/room-actions"
import { useState } from "react"

export default function CreateRoomForm() {
  const [loading, setLoading] = useState(false)
  
  async function handleSubmit(formData: FormData) {
    setLoading(true)
    try {
      await createRoom({
        roomNumber: formData.get("roomNumber") as string,
        monthlyRent: parseFloat(formData.get("rent") as string),
        wifiFee: parseFloat(formData.get("wifi") as string),
        electricityRatePerKwh: parseFloat(formData.get("rate") as string)
      })
      alert("Room created!")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }
  
  return <form action={handleSubmit}>...</form>
}
```

---

**Note**: All Server Actions are located in `app/actions/` directory and use the `"use server"` directive.
