import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!user.email) return false

      // Check if user exists in database
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      })

      // If user doesn't exist, deny access (whitelist only)
      if (!existingUser) {
        return "/auth/signin?error=NotWhitelisted"
      }

      // Check if user is active
      if (!existingUser.isActive) {
        return "/auth/signin?error=AccountInactive"
      }

      // Update googleId if signing in with Google for the first time
      if (account?.provider === "google" && !existingUser.googleId) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { googleId: account.providerAccountId }
        })
      }

      return true
    },
    async jwt({ token, user, account }) {
      if (user) {
        // Fetch user role from database
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { id: true, role: true, isActive: true }
        })
        
        if (dbUser) {
          token.role = dbUser.role
          token.id = dbUser.id
          token.isActive = dbUser.isActive
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.role = token.role as UserRole
        session.user.id = token.id as string
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
