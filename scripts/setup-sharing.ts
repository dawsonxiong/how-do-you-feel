import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("Fetching all users...")
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
    },
  })

  console.log(`Found ${users.length} users:`)
  users.forEach((user, index) => {
    console.log(`  ${index + 1}. ${user.name || user.email} (${user.id})`)
  })

  if (users.length < 2) {
    console.log("\n⚠️  Need at least 2 users to set up sharing. Please sign in with both accounts first.")
    return
  }

  // Set up bidirectional sharing between all users (works for 2 users now, scalable for more)
  console.log("\nSetting up bidirectional sharing between all users...")

  for (let i = 0; i < users.length; i++) {
    for (let j = i + 1; j < users.length; j++) {
      const user1 = users[i]
      const user2 = users[j]

      // Create bidirectional sharing
      await prisma.moodShare.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId: user1.id,
            toUserId: user2.id,
          },
        },
        create: {
          fromUserId: user1.id,
          toUserId: user2.id,
        },
        update: {},
      })

      await prisma.moodShare.upsert({
        where: {
          fromUserId_toUserId: {
            fromUserId: user2.id,
            toUserId: user1.id,
          },
        },
        create: {
          fromUserId: user2.id,
          toUserId: user1.id,
        },
        update: {},
      })

      console.log(`  ✓ ${user1.name || user1.email} ↔ ${user2.name || user2.email}`)
    }
  }

  console.log("\n✅ Sharing setup complete!")
}

main()
  .catch((e) => {
    console.error("Error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
