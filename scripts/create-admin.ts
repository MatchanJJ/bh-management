import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  log: ['error'],
});

async function main() {
  console.log('🔧 Creating initial admin user...')

  const email = 'admin@test.com'
  const password = 'admin123'
  const name = 'System Admin'

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('⚠️  Admin user already exists!')
    console.log(`Email: ${email}`)
    return
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10)

  // Create admin
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: 'ADMIN'
    }
  })

  console.log('✅ Admin user created successfully!')
  console.log(`📧 Email: ${email}`)
  console.log(`🔑 Password: ${password}`)
  console.log('')
  console.log('⚠️  IMPORTANT: Change these credentials after first login!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
