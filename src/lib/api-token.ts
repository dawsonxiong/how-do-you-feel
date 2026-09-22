import { prisma } from "@/lib/prisma"

// Shortcuts send the token as `Authorization: Bearer <token>`. The `?token=`
// query param is still accepted so existing shortcuts keep working.
export async function getUserFromApiToken(request: Request) {
  const header = request.headers.get("authorization")
  const token = header?.startsWith("Bearer ")
    ? header.slice("Bearer ".length).trim()
    : new URL(request.url).searchParams.get("token")

  if (!token) return null

  return prisma.user.findUnique({
    where: { apiToken: token },
    select: { id: true, name: true },
  })
}
