import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import Link from "next/link"
import { getBillingsByTenant } from "@/app/actions/billing-actions"
import { prisma } from "@/lib/prisma"

export default async function TenantDashboard() {
  const user = await requireRole([UserRole.TENANT])
  const billings = await getBillingsByTenant()
  
  const myRoom = await prisma.room.findFirst({
    where: { tenantId: user.id },
    include: {
      landlord: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  const pendingBillings = billings.filter(b => b.status === "PENDING")
  const paidBillings = billings.filter(b => b.status === "PAID")

  const navItems = [
    { label: "Dashboard", href: "/tenant" },
    { label: "My Billing", href: "/tenant/billing" }
  ]

  return (
    <DashboardLayout
      userName={user.name ?? 'Tenant'}
      userRole="Tenant"
      navItems={navItems}
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Tenant Dashboard
        </h2>

        {/* Room Info */}
        {myRoom ? (
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              My Room: {myRoom.roomNumber}
            </h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Monthly Rent: ₱{myRoom.monthlyRent.toFixed(2)}</p>
              <p>WiFi Fee: ₱{myRoom.wifiFee.toFixed(2)}</p>
              <p>Electricity Rate: ₱{myRoom.electricityRatePerKwh.toFixed(2)}/kWh</p>
              <p className="mt-2">Landlord: {myRoom.landlord.name} ({myRoom.landlord.email})</p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-8">
            <p className="text-sm text-yellow-800">
              You are not assigned to any room yet. Please contact your landlord.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <div className="text-gray-600 text-sm font-medium">
              Total Billings
            </div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              {billings.length}
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-6">
            <div className="text-red-600 text-sm font-medium">
              Pending Payments
            </div>
            <div className="text-3xl font-bold text-red-900 mt-2">
              {pendingBillings.length}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-6">
            <div className="text-green-600 text-sm font-medium">
              Paid/Verified
            </div>
            <div className="text-3xl font-bold text-green-900 mt-2">
              {billings.length - pendingBillings.length}
            </div>
          </div>
        </div>

        {/* Alerts */}
        {pendingBillings.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">
                  You have {pendingBillings.length} pending payment{pendingBillings.length > 1 ? 's' : ''}
                </p>
                <Link
                  href="/tenant/billing"
                  className="text-sm text-red-700 underline mt-1 inline-block"
                >
                  Pay now →
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
          <div className="space-y-3">
            <Link
              href="/tenant/billing"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="font-medium text-gray-900">View My Billing</div>
              <div className="text-sm text-gray-500 mt-1">
                Check bills and upload payment proofs
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Billings */}
        {billings.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Bills
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Month
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      WiFi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Electricity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {billings.slice(0, 5).map((billing) => (
                    <tr key={billing.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {billing.month}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{billing.rentAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{billing.wifiAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₱{billing.electricityAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₱{billing.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            billing.status === "VERIFIED"
                              ? "bg-green-100 text-green-800"
                              : billing.status === "PAID"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {billing.status}
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
