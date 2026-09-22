import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")?.trim()

    if (!email || !EMAIL.test(email)) {
      return NextResponse.json({ error: "A full email address is required" }, { status: 400 })
    }

    // Exact match only, so the user list can't be enumerated
    const users = await prisma.user.findMany({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
        // Don't include the current user
        id: {
          not: session.user.id,
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
      take: 1,
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error searching users:", error)
    return NextResponse.json({ error: "Failed to search users" }, { status: 500 })
  }
}
