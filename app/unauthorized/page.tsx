import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900">403</h1>
        <h2 className="mt-4 text-2xl font-semibold text-gray-700">
          Unauthorized Access
        </h2>
        <p className="mt-2 text-gray-500">
          You don't have permission to access this page.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}
