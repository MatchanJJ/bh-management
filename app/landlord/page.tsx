import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { getRoomsByLandlord } from "@/app/actions/room-actions"
import { getPendingBillingsByLandlord } from "@/app/actions/billing-actions"
import { getPendingPaymentProofs } from "@/app/actions/payment-actions"

export default async function LandlordDashboard() {
  const user = await requireRole([UserRole.LANDLORD])
  const rooms = await getRoomsByLandlord()
  const pendingBillings = await getPendingBillingsByLandlord()
  const pendingPayments = await getPendingPaymentProofs()

  const occupiedRooms = rooms.filter(r => r.tenantId).length
  const vacantRooms = rooms.length - occupiedRooms

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
          Landlord Dashboard
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-blue-600 text-sm font-medium">Total Rooms</div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {rooms.length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 text-sm font-medium">Occupied</div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {occupiedRooms}
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-6">
            <div className="text-yellow-600 text-sm font-medium">Vacant</div>
            <div className="text-3xl font-bold text-yellow-900 mt-2">
              {vacantRooms}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-purple-600 text-sm font-medium">
              Pending Payments
            </div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {pendingPayments.length}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {pendingPayments.length > 0 && (
          <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800">
                  You have {pendingPayments.length} payment{pendingPayments.length > 1 ? 's' : ''} to verify
                </p>
                <Link
                  href="/landlord/billing"
                  className="text-sm text-orange-700 underline mt-1 inline-block"
                >
                  Review now →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/landlord/rooms"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">Manage Rooms</div>
              <div className="text-sm text-gray-500 mt-1">
                Create and manage rental rooms
              </div>
            </Link>
            <Link
              href="/landlord/meter-readings"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">Record Meter Reading</div>
              <div className="text-sm text-gray-500 mt-1">
                Upload electricity meter readings
              </div>
            </Link>
            <Link
              href="/landlord/billing"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">View Billing</div>
              <div className="text-sm text-gray-500 mt-1">
                Check billing status and verify payments
              </div>
            </Link>
            <Link
              href="/landlord/tenants"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">Manage Tenants</div>
              <div className="text-sm text-gray-500 mt-1">
                View and create tenant accounts
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Rooms */}
        {rooms.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Rooms
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Room #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tenant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Monthly Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.slice(0, 5).map((room) => (
                    <tr key={room.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {room.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {room.tenant ? room.tenant.name : "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{room.monthlyRent.toFixed(2)}
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
        )}
      </div>
    </DashboardLayout>
  )
}
