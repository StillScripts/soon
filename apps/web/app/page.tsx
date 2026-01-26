"use client"

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

export default function Home() {
  const things = useQuery(api.things.getThings)
  const createThing = useMutation(api.things.createThing)
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

  return (
    <div className="min-h-screen grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-20 gap-16">
      <main className="flex flex-col gap-8 row-start-2 items-center w-full max-w-lg">
        <h1 className="text-3xl font-bold">Things Manager</h1>

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
            <CardTitle>All Things</CardTitle>
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
                    <span className="text-xs text-muted-foreground">
                      {new Date(thing._creationTime).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
