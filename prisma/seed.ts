import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log("🌱 Seeding database...");

  // Check if admin already exists
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log("✅ Admin user already exists:", existingAdmin.email);
    return;
  }

  // Create admin user (replace with your Google email)
  const admin = await prisma.user.create({
    data: {
      name: "AdminMark",
      email: "jedzxcx1@gmail.com", // Replace with your Google email
      role: "ADMIN",
      isActive: true
    },
  });

  console.log("✅ Admin user whitelisted:");
  console.log("   Email:", admin.email);
  console.log("   ID:", admin.id);
  console.log("   This email can now sign in with Google OAuth");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
