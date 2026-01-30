"use client"

import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field"
import { Input } from "@repo/ui/components/ui/input"
import { createThingSchema } from "@repo/validators/things"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { AuthForm } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { useCRPC } from "@/lib/convex/crpc"

function ThingsManager() {
	const crpc = useCRPC()
	const queryClient = useQueryClient()

	const { data: things, isPending: isLoading, error } = useQuery(crpc.things.list.queryOptions({}))

	const invalidateThings = () => queryClient.invalidateQueries(crpc.things.list.queryFilter({}))

	const createThing = useMutation(
		crpc.things.create.mutationOptions({
			onSuccess: invalidateThings,
		})
	)

	const deleteThing = useMutation(
		crpc.things.remove.mutationOptions({
			onSuccess: invalidateThings,
		})
	)

	const form = useForm({
		defaultValues: {
			title: "",
		},
		onSubmit: async ({ value }) => {
			try {
				await createThing.mutateAsync({ title: value.title.trim() })
				form.reset()
			} catch (_err) {
				// Error is handled by the mutation
			}
		},
	})

	return (
		<>
			<Card className="w-full">
				<CardHeader>
					<CardTitle>Create a Thing</CardTitle>
				</CardHeader>
				<CardContent>
					<form
						onSubmit={(e) => {
							e.preventDefault()
							e.stopPropagation()
							form.handleSubmit()
						}}
					>
						<FieldGroup>
							<form.Field
								name="title"
								validators={{
									onChange: ({ value }) => {
										const result = createThingSchema.shape.title.safeParse(value)
										return result.success ? undefined : result.error.issues[0]?.message
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel htmlFor="title">Title</FieldLabel>
										<div className="flex gap-2">
											<Input
												id="title"
												type="text"
												placeholder="Enter thing title..."
												value={field.state.value}
												onChange={(e) => field.handleChange(e.target.value)}
												onBlur={field.handleBlur}
												disabled={createThing.isPending}
												className="flex-1"
											/>
											<Button
												type="submit"
												disabled={createThing.isPending || !field.state.value.trim()}
											>
												{createThing.isPending ? "Creating..." : "Create"}
											</Button>
										</div>
										{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
											<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
										)}
									</Field>
								)}
							</form.Field>
						</FieldGroup>
					</form>
				</CardContent>
			</Card>

			<Card className="w-full">
				<CardHeader>
					<CardTitle>Your Things</CardTitle>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<p className="text-muted-foreground">Loading...</p>
					) : error ? (
						<p className="text-destructive">Error loading things</p>
					) : things?.length === 0 ? (
						<p className="text-muted-foreground">No things yet. Create one above!</p>
					) : (
						<ul className="space-y-2">
							{things?.map((thing) => (
								<li
									key={thing._id}
									className="bg-secondary flex items-center justify-between rounded-lg p-4"
								>
									<span>{thing.title}</span>
									<div className="flex items-center gap-4">
										<span className="text-muted-foreground text-xs">
											{new Date(thing._creationTime).toLocaleDateString()}
										</span>
										<Button
											variant="ghost"
											size="sm"
											onClick={() => deleteThing.mutate({ id: thing._id })}
											disabled={deleteThing.isPending}
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
			<span className="text-muted-foreground text-sm">{session?.user?.email}</span>
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
			<div className="grid min-h-screen place-items-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		)
	}

	if (!session) {
		return (
			<div className="grid min-h-screen place-items-center p-4">
				<AuthForm />
			</div>
		)
	}

	return (
		<div className="grid min-h-screen grid-rows-[auto_1fr_auto] gap-8 p-8">
			<header className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Things Manager</h1>
				<UserHeader />
			</header>

			<main className="mx-auto flex w-full max-w-lg flex-col items-center gap-8">
				<ThingsManager />
			</main>

			<footer className="text-muted-foreground text-center text-sm">
				Powered by Convex + Better Auth + TanStack Query
			</footer>
		</div>
	)
}
