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
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Meter Readings
        </h2>

        {/* Create Meter Reading Form */}
        <div className="mb-8 p-6 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Record New Meter Reading
          </h3>
          <CreateMeterReadingForm rooms={rooms} />
        </div>

        {/* Meter Readings List */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Meter Readings
          </h3>
          {meterReadings.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No meter readings recorded yet.
            </p>
          ) : (
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
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Previous
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Current
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usage (kWh)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Photo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {meterReadings.map((reading) => (
                    <tr key={reading.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {reading.room.roomNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.room.tenant?.name || "—"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.previousReading.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reading.currentReading.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {reading.usage.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <a
                          href={reading.meterPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900"
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
