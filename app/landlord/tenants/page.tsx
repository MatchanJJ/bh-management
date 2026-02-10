import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import { getAllTenants } from "@/app/actions/user-actions"
import { getRoomsByLandlord } from "@/app/actions/room-actions"
import CreateTenantForm from "@/components/CreateTenantForm"
import DeactivateTenantButton from "@/components/RemoveTenantButton"

export default async function TenantsPage() {
  const user = await requireRole([UserRole.LANDLORD])
  const tenants = await getAllTenants()
  const rooms = await getRoomsByLandlord()

  const navItems = [
    { label: "Dashboard", href: "/landlord" },
    { label: "Rooms", href: "/landlord/rooms" },
    { label: "Meter Readings", href: "/landlord/meter-readings" },
    { label: "Billing", href: "/landlord/billing" },
    { label: "Tenants", href: "/landlord/tenants" }
  ]

  return (
    <DashboardLayout
      userName={user.name ?? 'Landlord'}
      userRole="Landlord"
      navItems={navItems}
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Tenants
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage tenant accounts and room assignments
          </p>
        </div>

        {/* Create Tenant Form */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium mb-4">
            Whitelist New Tenant
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add a tenant's Google email to whitelist them. They can then sign in with Google.
          </p>
          <CreateTenantForm rooms={rooms.filter(r => !r.tenantId)} />
        </div>

        {/* Tenants List */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 pb-3">
            <h3 className="text-lg font-medium">
              All Tenants
              <span className="text-sm font-normal text-muted-foreground ml-2">({tenants.length})</span>
            </h3>
          </div>
          {tenants.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No tenants yet.</p>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-t">
                  <tr className="border-b">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Room
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Status
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Joined
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tenants.map((tenant) => (
                    <tr key={tenant.id} className="border-b">
                      <td className="p-6 align-middle font-medium">
                        {tenant.name}
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {tenant.email}
                      </td>
                      <td className="p-6 align-middle">
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                          {tenant.roomTenant?.roomNumber || "—"}
                        </span>
                      </td>
                      <td className="p-6 align-middle">
                        <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                          tenant.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          {tenant.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {new Date(tenant.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-6 align-middle">
                        <DeactivateTenantButton 
                          tenantId={tenant.id} 
                          tenantName={tenant.name} 
                          isActive={tenant.isActive}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
