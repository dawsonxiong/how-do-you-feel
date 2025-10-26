import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete all mood entries for the current user
    const result = await prisma.moodEntry.deleteMany({
      where: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
    })
  } catch (error) {
    console.error("Error resetting mood entries:", error)
    return NextResponse.json({ error: "Failed to reset mood entries" }, { status: 500 })
  }
}
