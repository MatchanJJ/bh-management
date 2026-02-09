import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"
import { UserRole } from "@prisma/client"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const path = req.nextUrl.pathname

    // Admin routes
    if (path.startsWith("/admin")) {
      if (token?.role !== UserRole.ADMIN) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Landlord routes
    if (path.startsWith("/landlord")) {
      if (token?.role !== UserRole.LANDLORD) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    // Tenant routes
    if (path.startsWith("/tenant")) {
      if (token?.role !== UserRole.TENANT) {
        return NextResponse.redirect(new URL("/unauthorized", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
    pages: {
      signIn: "/auth/signin"
    }
  }
)

export const config = {
  matcher: ["/admin/:path*", "/landlord/:path*", "/tenant/:path*"]
}
