import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import { getAllMeterReadings } from "@/app/actions/meter-actions"
import { getRoomsByLandlord } from "@/app/actions/room-actions"
import CreateMeterReadingForm from "@/components/CreateMeterReadingForm"

export default async function MeterReadingsPage() {
  const user = await requireRole([UserRole.LANDLORD])
  const meterReadings = await getAllMeterReadings()
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
            Meter Readings
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage electricity meter readings
          </p>
        </div>

        {/* Create Meter Reading Form */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="text-lg font-medium mb-4">
            Record New Meter Reading
          </h3>
          <CreateMeterReadingForm rooms={rooms} />
        </div>

        {/* Meter Readings List */}
        <div className="rounded-lg border bg-card">
          <div className="p-6 pb-3">
            <h3 className="text-lg font-medium">
              Recent Readings
            </h3>
          </div>
          {meterReadings.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No meter readings recorded yet.
            </p>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="border-t">
                  <tr className="border-b">
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Room
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Tenant
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Month
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Previous
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Current
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Usage
                    </th>
                    <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground">
                      Photo
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {meterReadings.map((reading) => (
                    <tr key={reading.id} className="border-b">
                      <td className="p-6 align-middle font-medium">
                        {reading.room.roomNumber}
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {reading.room.tenant?.name || "—"}
                      </td>
                      <td className="p-6 align-middle">
                        <span className="inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold">
                          {reading.month}
                        </span>
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {reading.previousReading.toFixed(2)} kWh
                      </td>
                      <td className="p-6 align-middle text-muted-foreground">
                        {reading.currentReading.toFixed(2)} kWh
                      </td>
                      <td className="p-6 align-middle font-semibold">
                        {reading.usage.toFixed(2)} kWh
                      </td>
                      <td className="p-6 align-middle">
                        <a
                          href={reading.meterPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium underline underline-offset-4 hover:text-primary"
                        >
                          View
                        </a>
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
