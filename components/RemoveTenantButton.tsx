"use client"

import { useState } from "react"
import { deactivateTenant } from "@/app/actions/user-actions"

type DeactivateTenantButtonProps = {
  tenantId: string
  tenantName: string
  isActive: boolean
}

export default function DeactivateTenantButton({ tenantId, tenantName, isActive }: DeactivateTenantButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      await deactivateTenant(tenantId)
      setShowConfirm(false)
    } catch (error: any) {
      alert(error.message || "Failed to deactivate tenant")
    } finally {
      setLoading(false)
    }
  }

  if (!isActive) {
    return (
      <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground">
        Inactive
      </span>
    )
  }

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Deactivate {tenantName}?</span>
        <button
          onClick={handleDeactivate}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
        >
          {loading ? "..." : "Yes"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          className="inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 border border-input bg-background hover:bg-accent hover:text-accent-foreground"
        >
          No
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-3 hover:bg-accent hover:text-accent-foreground transition-colors"
    >
      Deactivate
    </button>
  )
}
