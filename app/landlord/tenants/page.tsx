import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import { getAllTenants } from "@/app/actions/user-actions"
import { getRoomsByLandlord } from "@/app/actions/room-actions"
import CreateTenantForm from "@/components/CreateTenantForm"

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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tenants Management
        </h2>

        {/* Create Tenant Form */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Tenant
          </h3>
          <CreateTenantForm rooms={rooms.filter(r => !r.tenantId)} />
        </div>

        {/* Tenants List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Tenants ({tenants.length})
          </h3>
          {tenants.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tenants yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tenants.map((tenant) => (
                    <tr key={tenant.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tenant.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tenant.roomTenant?.roomNumber || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(tenant.createdAt).toLocaleDateString()}
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
