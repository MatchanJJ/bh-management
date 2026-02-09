import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth-utils"
import { UserRole } from "@prisma/client"

export default async function Home() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/auth/signin")
  }

  // Redirect based on role
  switch (user.role) {
    case UserRole.ADMIN:
      redirect("/admin")
    case UserRole.LANDLORD:
      redirect("/landlord")
    case UserRole.TENANT:
      redirect("/tenant")
    default:
      redirect("/auth/signin")
  }
}
