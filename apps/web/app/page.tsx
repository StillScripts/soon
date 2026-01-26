"use client"

import { AuthForm } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { Button } from "@repo/ui/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card"
import { Input } from "@repo/ui/components/ui/input"
import { api } from "backend/convex"
import { useMutation, useQuery } from "convex/react"
import { type FormEvent, useState } from "react"

function ThingsManager() {
  const things = useQuery(api.things.getThings)
  const createThing = useMutation(api.things.createThing)
  const deleteThing = useMutation(api.things.deleteThing)
  const [title, setTitle] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    try {
      await createThing({ title: title.trim() })
      setTitle("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    await deleteThing({ id: id as Parameters<typeof deleteThing>[0]["id"] })
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create a Thing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter thing title..."
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !title.trim()}>
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Things</CardTitle>
        </CardHeader>
        <CardContent>
          {things === undefined ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : things.length === 0 ? (
            <p className="text-muted-foreground">
              No things yet. Create one above!
            </p>
          ) : (
            <ul className="space-y-2">
              {things.map((thing) => (
                <li
                  key={thing._id}
                  className="p-4 bg-secondary rounded-lg flex justify-between items-center"
                >
                  <span>{thing.title}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-muted-foreground">
                      {new Date(thing._creationTime).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(thing._id)}
                      className="text-destructive hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function UserHeader() {
  const { data: session } = authClient.useSession()

  const handleSignOut = async () => {
    await authClient.signOut()
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-muted-foreground">
        {session?.user?.email}
      </span>
      <Button variant="outline" size="sm" onClick={handleSignOut}>
        Sign out
      </Button>
    </div>
  )
}

export default function Home() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="min-h-screen grid place-items-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <AuthForm />
      </div>
    )
  }

  return (
    <div className="min-h-screen grid grid-rows-[auto_1fr_auto] p-8 gap-8">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Things Manager</h1>
        <UserHeader />
      </header>

      <main className="flex flex-col gap-8 items-center w-full max-w-lg mx-auto">
        <ThingsManager />
      </main>

      <footer className="text-center text-sm text-muted-foreground">
        Powered by Convex + Better Auth
      </footer>
    </div>
  )
}
