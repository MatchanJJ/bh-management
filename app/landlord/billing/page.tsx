import { requireRole } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"
import DashboardLayout from "@/components/DashboardLayout"
import { getBillingsByLandlord } from "@/app/actions/billing-actions"
import VerifyPaymentButton from "@/components/VerifyPaymentButton"
import { calculateDueDateStatus, formatDueDate } from "@/lib/due-date-utils"

export default async function LandlordBillingPage() {
  const user = await requireRole([UserRole.LANDLORD])
  const billings = await getBillingsByLandlord()

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
          Billing Management
        </h2>

        {billings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No billing records yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Billings are automatically generated when you record meter readings.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {billings.map((billing) => {
              const dueDateStatus = calculateDueDateStatus(
                billing.month,
                billing.room.billingDueDay,
                billing.status
              )
              
              return (
              <div
                key={billing.id}
                className={`border-2 rounded-lg p-6 hover:shadow-md transition ${
                  dueDateStatus.statusColor === 'red' && billing.status === 'PENDING'
                    ? 'border-red-300 bg-red-50'
                    : dueDateStatus.statusColor === 'yellow' && billing.status === 'PENDING'
                    ? 'border-yellow-300 bg-yellow-50'
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Room {billing.room.roomNumber} - {billing.month}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created {new Date(billing.createdAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          dueDateStatus.statusColor === 'green'
                            ? 'bg-green-100 text-green-800'
                            : dueDateStatus.statusColor === 'yellow'
                            ? 'bg-yellow-100 text-yellow-800'
                            : dueDateStatus.statusColor === 'red'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {dueDateStatus.statusText}
                      </span>
                      <span className="text-xs text-gray-500">
                        Due: {formatDueDate(dueDateStatus.dueDate)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full ${
                      billing.status === "VERIFIED"
                        ? "bg-green-100 text-green-800"
                        : billing.status === "PAID"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {billing.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500">Monthly Rent</div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₱{billing.rentAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">WiFi Fee</div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₱{billing.wifiAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Electricity</div>
                    <div className="text-sm font-semibold text-gray-900">
                      ₱{billing.electricityAmount.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Total Amount</div>
                    <div className="text-lg font-bold text-indigo-600">
                      ₱{billing.totalAmount.toFixed(2)}
                    </div>
                  </div>
                </div>

                {billing.paymentProofs.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Payment Proof Uploaded
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Method: {billing.paymentProofs[0].paymentMethod}
                        </div>
                        <div className="text-sm text-gray-600">
                          By: {billing.paymentProofs[0].uploadedBy.name}
                        </div>
                        <div className="text-sm text-gray-600">
                          Uploaded: {new Date(billing.paymentProofs[0].createdAt).toLocaleDateString()}
                        </div>
                        {billing.paymentProofs[0].verifiedAt && (
                          <div className="text-sm text-green-600 mt-2">
                            ✓ Verified on {new Date(billing.paymentProofs[0].verifiedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={billing.paymentProofs[0].receiptPhotoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition"
                        >
                          View Receipt
                        </a>
                        {!billing.paymentProofs[0].verifiedAt && (
                          <VerifyPaymentButton paymentProofId={billing.paymentProofs[0].id} />
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                      No payment proof uploaded yet
                    </p>
                  </div>
                )}
              </div>
              )
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
