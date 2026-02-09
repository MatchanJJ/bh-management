import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { prisma } from "@/lib/prisma"

export default async function AdminDashboard() {
  const user = await requireRole([UserRole.ADMIN])

  const stats = {
    totalLandlords: await prisma.user.count({
      where: { role: UserRole.LANDLORD }
    }),
    totalTenants: await prisma.user.count({
      where: { role: UserRole.TENANT }
    }),
    totalRooms: await prisma.room.count()
  }

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Landlords", href: "/admin/landlords" }
  ]

  return (
    <DashboardLayout
      userName={user.name ?? 'Admin'}
      userRole="Admin"
      navItems={navItems}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h2>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="text-blue-600 text-sm font-medium">
              Total Landlords
            </div>
            <div className="text-3xl font-bold text-blue-900 mt-2">
              {stats.totalLandlords}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 text-sm font-medium">
              Total Tenants
            </div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {stats.totalTenants}
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-6">
            <div className="text-purple-600 text-sm font-medium">
              Total Rooms
            </div>
            <div className="text-3xl font-bold text-purple-900 mt-2">
              {stats.totalRooms}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link
              href="/admin/landlords"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">
                Manage Landlords
              </div>
              <div className="text-sm text-gray-500 mt-1">
                View and create landlord accounts
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
