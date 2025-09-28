const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

// Sample data for realistic mood entries
const sampleTags = [
  "work,stress",
  "family,love",
  "exercise,health",
  "friends,social",
  "sleep,tired",
  "weather,sunny",
  "music,relaxing",
  "food,comfort",
  "success,achievement",
  "anxiety,worry",
  "gratitude,thankful",
  "creative,inspired",
  "nature,peaceful",
  "relationship,happy",
  "challenge,growth",
]

const sampleNotes = [
  "Had a great workout this morning",
  "Work presentation went really well",
  "Feeling overwhelmed with deadlines",
  "Beautiful day spent with family",
  "Didn't sleep well last night",
  "Accomplished everything on my todo list",
  "Having some anxiety about tomorrow",
  "Grateful for good friends",
  "Feeling creative and inspired today",
  "Long walk in nature was refreshing",
  "Stressful meeting but handled it well",
  "Cozy evening at home",
  "Feeling proud of recent progress",
  "Missing home and family",
  "Had an amazing conversation with a friend",
]

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)]
}

function getRandomRating() {
  // Weight towards middle values for more realistic distribution
  const weights = [1, 2, 3, 5, 8, 12, 15, 12, 8, 5, 3] // 0-10
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0)
  const random = Math.random() * totalWeight

  let weightSum = 0
  for (let i = 0; i < weights.length; i++) {
    weightSum += weights[i]
    if (random <= weightSum) {
      return i
    }
  }
  return 5 // fallback
}

async function seedData() {
  console.log("🌱 Seeding mood data...")

  // Clear existing data
  await prisma.moodEntry.deleteMany()
  console.log("🧹 Cleared existing data")

  const currentDate = new Date("2024-09-28T13:28:48.848Z")
  const entries = []

  // Generate data for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(currentDate)
    date.setDate(date.getDate() - i)

    // Some days have no entries (more realistic)
    if (Math.random() < 0.15) continue

    // Some days have multiple entries (20% chance)
    const entryCount = Math.random() < 0.2 ? Math.floor(Math.random() * 3) + 2 : 1

    for (let j = 0; j < entryCount; j++) {
      const rating = getRandomRating()

      // Higher chance of tags/notes for extreme moods
      const shouldHaveTags = rating <= 3 || rating >= 8 || Math.random() < 0.4
      const shouldHaveNotes = rating <= 2 || rating >= 9 || Math.random() < 0.3

      entries.push({
        rating: rating,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()), // Start of day
        tags: shouldHaveTags ? getRandomElement(sampleTags) : null,
        notes: shouldHaveNotes ? getRandomElement(sampleNotes) : null,
      })
    }
  }

  // Insert all entries
  for (const entry of entries) {
    await prisma.moodEntry.create({
      data: entry,
    })
  }

  console.log(`✅ Created ${entries.length} mood entries`)
  console.log(
    `📊 Date range: ${Math.min(...entries.map((e) => e.date))} to ${Math.max(...entries.map((e) => e.date))}`
  )

  // Show some stats
  const avgRating = entries.reduce((sum, e) => sum + e.rating, 0) / entries.length
  const daysWithMultipleEntries = entries.reduce((acc, entry) => {
    const dateKey = entry.date.toDateString()
    acc[dateKey] = (acc[dateKey] || 0) + 1
    return acc
  }, {})
  const multipleDays = Object.values(daysWithMultipleEntries).filter((count) => count > 1).length

  console.log(`📈 Average mood: ${avgRating.toFixed(1)}/10`)
  console.log(`📅 Days with multiple entries: ${multipleDays}`)
  console.log(`🏷️ Entries with tags: ${entries.filter((e) => e.tags).length}`)
  console.log(`📝 Entries with notes: ${entries.filter((e) => e.notes).length}`)
}

async function main() {
  try {
    await seedData()
  } catch (error) {
    console.error("❌ Error seeding data:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
