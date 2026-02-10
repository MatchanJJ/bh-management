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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Landlords Management
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Manage landlord accounts and whitelist access
            </p>
          </div>
          <CreateLandlordForm />
        </div>

        {/* Landlords List */}
        <div className="rounded-lg border border-border bg-card">
          <div className="p-6 border-b border-border">
            <h3 className="text-base font-semibold">
              All Landlords ({landlords.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="h-12 px-6 text-left text-sm font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="h-12 px-6 text-left text-sm font-medium text-muted-foreground">
                    Email
                  </th>
                  <th className="h-12 px-6 text-left text-sm font-medium text-muted-foreground">
                    Rooms
                  </th>
                  <th className="h-12 px-6 text-left text-sm font-medium text-muted-foreground">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody>
                {landlords.map((landlord) => (
                  <tr key={landlord.id} className="border-b border-border last:border-0">
                    <td className="h-14 px-6 text-sm font-medium">
                      {landlord.name}
                    </td>
                    <td className="h-14 px-6 text-sm text-muted-foreground">
                      {landlord.email}
                    </td>
                    <td className="h-14 px-6 text-sm text-muted-foreground">
                      {landlord._count.roomsOwned}
                    </td>
                    <td className="h-14 px-6 text-sm text-muted-foreground">
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
