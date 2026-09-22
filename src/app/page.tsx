import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { Home } from "@/components/Home"

export default async function Page() {
  const session = await auth()
  if (!session) redirect("/auth/signin")

  return <Home />
}
