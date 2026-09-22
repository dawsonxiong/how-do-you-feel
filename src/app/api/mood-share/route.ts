import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET: Get all users I'm sharing with and viewing from
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get users whose mood I can view (they're sharing with me)
    const viewableUsers = await prisma.moodShare.findMany({
      where: {
        toUserId: session.user.id,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    // Get users I'm sharing my mood with
    const sharingWith = await prisma.moodShare.findMany({
      where: {
        fromUserId: session.user.id,
      },
      include: {
        toUser: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({
      viewableUsers: viewableUsers.map((share) => ({
        id: share.fromUser.id,
        name: share.fromUser.name,
        email: share.fromUser.email,
        image: share.fromUser.image,
        sharedAt: share.createdAt,
      })),
      sharingWith: sharingWith.map((share) => ({
        id: share.toUser.id,
        name: share.toUser.name,
        email: share.toUser.email,
        image: share.toUser.image,
        sharedAt: share.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching mood shares:", error)
    return NextResponse.json({ error: "Failed to fetch mood shares" }, { status: 500 })
  }
}

// POST: Create a bidirectional sharing relationship
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId || targetUserId === session.user.id) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 })
    }

    // Verify target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Share my mood with them. They only see it; seeing theirs requires them to share back.
    await prisma.moodShare.upsert({
      where: {
        fromUserId_toUserId: {
          fromUserId: session.user.id,
          toUserId: targetUserId,
        },
      },
      create: {
        fromUserId: session.user.id,
        toUserId: targetUserId,
      },
      update: {},
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error creating mood share:", error)
    return NextResponse.json({ error: "Failed to create mood share" }, { status: 500 })
  }
}

// DELETE: Remove a bidirectional sharing relationship
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { targetUserId } = await request.json()

    if (!targetUserId) {
      return NextResponse.json({ error: "Invalid target user" }, { status: 400 })
    }

    // Disconnect fully: stop sharing with them and stop seeing their mood
    await prisma.$transaction([
      prisma.moodShare.deleteMany({
        where: {
          fromUserId: session.user.id,
          toUserId: targetUserId,
        },
      }),
      prisma.moodShare.deleteMany({
        where: {
          fromUserId: targetUserId,
          toUserId: session.user.id,
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting mood share:", error)
    return NextResponse.json({ error: "Failed to delete mood share" }, { status: 500 })
  }
}
