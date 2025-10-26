import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET - Returns user's API token (generates if doesn't exist)
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { apiToken: true },
    })

    // Generate token if doesn't exist
    if (!user?.apiToken) {
      const newToken = crypto.randomUUID()
      user = await prisma.user.update({
        where: { id: session.user.id },
        data: { apiToken: newToken },
        select: { apiToken: true },
      })
    }

    return NextResponse.json({ token: user.apiToken })
  } catch (error) {
    console.error("Error getting API token:", error)
    return NextResponse.json({ error: "Failed to get API token" }, { status: 500 })
  }
}

// POST - Regenerates user's API token
export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const newToken = crypto.randomUUID()
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { apiToken: newToken },
      select: { apiToken: true },
    })

    return NextResponse.json({ token: user.apiToken })
  } catch (error) {
    console.error("Error regenerating API token:", error)
    return NextResponse.json({ error: "Failed to regenerate API token" }, { status: 500 })
  }
}
