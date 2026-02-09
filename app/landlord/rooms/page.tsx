import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import { getRoomsByLandlord } from "@/app/actions/room-actions"
import CreateRoomForm from "@/components/CreateRoomForm"

export default async function RoomsPage() {
  const user = await requireRole([UserRole.LANDLORD])
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
          Rooms Management
        </h2>

        {/* Create Room Form */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Room
          </h3>
          <CreateRoomForm />
        </div>

        {/* Rooms List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Rooms ({rooms.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Room #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Monthly Rent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    WiFi Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Electricity Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {room.roomNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{room.monthlyRent.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{room.wifiFee.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ₱{room.electricityRatePerKwh.toFixed(2)}/kWh
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {room.tenant ? room.tenant.name : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          room.tenantId
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {room.tenantId ? "Occupied" : "Vacant"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
