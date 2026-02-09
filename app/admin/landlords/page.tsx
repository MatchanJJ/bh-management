import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import { getAllLandlords } from "@/app/actions/user-actions"
import CreateLandlordForm from "@/components/CreateLandlordForm"

export default async function LandlordsPage() {
  const user = await requireRole([UserRole.ADMIN])
  const landlords = await getAllLandlords()

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
          Landlords Management
        </h2>

        {/* Create Landlord Form */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Landlord
          </h3>
          <CreateLandlordForm />
        </div>

        {/* Landlords List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            All Landlords ({landlords.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rooms
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {landlords.map((landlord) => (
                  <tr key={landlord.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {landlord.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {landlord.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {landlord._count.roomsOwned}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(landlord.createdAt).toLocaleDateString()}
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
