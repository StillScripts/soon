// oxlint-disable nextjs/no-img-element
"use client"

import { useRef, useState } from "react"

import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { createThingSchema, updateThingSchema } from "@repo/validators/things"
import { useForm } from "@tanstack/react-form"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { AuthForm } from "@/components/auth-form"
import { authClient } from "@/lib/auth-client"
import { useCRPC } from "@/lib/convex/crpc"

type Thing = {
	_id: string
	_creationTime: number
	title: string
	description?: string
	imageId?: string
	userId: string
	imageUrl: string | null
}

function ImageUpload({
	imageUrl,
	onUpload,
	onRemove,
	disabled,
}: {
	imageUrl: string | null
	onUpload: (file: File) => Promise<void>
	onRemove: () => void
	disabled?: boolean
}) {
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [isUploading, setIsUploading] = useState(false)

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file) return

		setIsUploading(true)
		try {
			await onUpload(file)
		} finally {
			setIsUploading(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ""
			}
		}
	}

	return (
		<div className="space-y-2">
			{imageUrl ? (
				<div className="relative">
					<img src={imageUrl} alt="Thing" className="h-32 w-full rounded-lg object-cover" />
					<Button
						type="button"
						variant="destructive"
						size="sm"
						className="absolute top-2 right-2"
						onClick={onRemove}
						disabled={disabled}
					>
						Remove
					</Button>
				</div>
			) : (
				<div
					className="border-muted-foreground/25 hover:border-muted-foreground/50 flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed"
					onClick={() => fileInputRef.current?.click()}
				>
					<span className="text-muted-foreground text-sm">
						{isUploading ? "Uploading..." : "Click to upload image"}
					</span>
				</div>
			)}
			<input
				ref={fileInputRef}
				type="file"
				accept="image/*"
				onChange={handleFileChange}
				disabled={disabled || isUploading}
				className="hidden"
			/>
		</div>
	)
}

function ThingItem({
	thing,
	onDelete,
	onUpdate,
	isDeleting,
}: {
	thing: Thing
	onDelete: () => void
	onUpdate: (data: { title?: string; description?: string | null; imageId?: string | null }) => void
	isDeleting: boolean
}) {
	const crpc = useCRPC()
	const [isEditing, setIsEditing] = useState(false)
	const [editImageUrl, setEditImageUrl] = useState<string | null>(thing.imageUrl)
	const [editImageId, setEditImageId] = useState<string | undefined>(thing.imageId)

	const generateUploadUrl = useMutation(crpc.things.generateUploadUrl.mutationOptions({}))

	const handleImageUpload = async (file: File) => {
		const uploadUrl = await generateUploadUrl.mutateAsync()
		const result = await fetch(uploadUrl, {
			method: "POST",
			headers: { "Content-Type": file.type },
			body: file,
		})
		const { storageId } = await result.json()
		setEditImageId(storageId)
		setEditImageUrl(URL.createObjectURL(file))
	}

	const form = useForm({
		defaultValues: {
			title: thing.title,
			description: thing.description ?? "",
		},
		onSubmit: async ({ value }) => {
			onUpdate({
				title: value.title.trim(),
				description: value.description.trim() || null,
				imageId: editImageId ?? null,
			})
			setIsEditing(false)
		},
	})

	if (isEditing) {
		return (
			<li className="bg-secondary rounded-lg p-4">
				<form
					onSubmit={(e) => {
						e.preventDefault()
						e.stopPropagation()
						form.handleSubmit()
					}}
					className="space-y-4"
				>
					<ImageUpload
						imageUrl={editImageUrl}
						onUpload={handleImageUpload}
						onRemove={() => {
							setEditImageId(undefined)
							setEditImageUrl(null)
						}}
					/>

					<form.Field
						name="title"
						validators={{
							onChange: ({ value }) => {
								const result = updateThingSchema.shape.title.safeParse(value)
								return result.success ? undefined : result.error.issues[0]?.message
							},
						}}
					>
						{(field) => (
							<Field>
								<FieldLabel htmlFor={`edit-title-${thing._id}`}>Title</FieldLabel>
								<Input
									id={`edit-title-${thing._id}`}
									type="text"
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
								/>
								{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
									<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
								)}
							</Field>
						)}
					</form.Field>

					<form.Field name="description">
						{(field) => (
							<Field>
								<FieldLabel htmlFor={`edit-description-${thing._id}`}>Description</FieldLabel>
								<Textarea
									id={`edit-description-${thing._id}`}
									value={field.state.value}
									onChange={(e) => field.handleChange(e.target.value)}
									onBlur={field.handleBlur}
									rows={3}
									placeholder="Add a description..."
								/>
							</Field>
						)}
					</form.Field>

					<div className="flex justify-end gap-2">
						<Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>
							Cancel
						</Button>
						<Button type="submit" size="sm">
							Save
						</Button>
					</div>
				</form>
			</li>
		)
	}

	return (
		<li className="bg-secondary rounded-lg p-4">
			<div className="flex gap-4">
				{thing.imageUrl && (
					<img
						src={thing.imageUrl}
						alt={thing.title}
						className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
					/>
				)}
				<div className="flex flex-1 flex-col gap-1">
					<div className="flex items-start justify-between">
						<span className="font-medium">{thing.title}</span>
						<div className="flex items-center gap-2">
							<span className="text-muted-foreground text-xs">
								{new Date(thing._creationTime).toLocaleDateString()}
							</span>
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setIsEditing(true)}
								disabled={isDeleting}
							>
								Edit
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={onDelete}
								disabled={isDeleting}
								className="text-destructive hover:text-destructive"
							>
								Delete
							</Button>
						</div>
					</div>
					{thing.description && (
						<p className="text-muted-foreground text-sm">{thing.description}</p>
					)}
				</div>
			</div>
		</li>
	)
}

function ThingsManager() {
	const crpc = useCRPC()
	const queryClient = useQueryClient()
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const fileInputRef = useRef<HTMLInputElement>(null)

	const { data: things, isPending: isLoading, error } = useQuery(crpc.things.list.queryOptions({}))

	const invalidateThings = () => queryClient.invalidateQueries(crpc.things.list.queryFilter({}))

	const generateUploadUrl = useMutation(crpc.things.generateUploadUrl.mutationOptions({}))

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

	const updateThing = useMutation(
		crpc.things.update.mutationOptions({
			onSuccess: invalidateThings,
		})
	)

	const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			setImageFile(file)
			setImagePreview(URL.createObjectURL(file))
		}
	}

	const clearImage = () => {
		setImageFile(null)
		setImagePreview(null)
		if (fileInputRef.current) {
			fileInputRef.current.value = ""
		}
	}

	const form = useForm({
		defaultValues: {
			title: "",
			description: "",
		},
		onSubmit: async ({ value }) => {
			try {
				let imageId: string | undefined

				if (imageFile) {
					const uploadUrl = await generateUploadUrl.mutateAsync()
					const result = await fetch(uploadUrl, {
						method: "POST",
						headers: { "Content-Type": imageFile.type },
						body: imageFile,
					})
					const json = await result.json()
					imageId = json.storageId
				}

				await createThing.mutateAsync({
					title: value.title.trim(),
					description: value.description.trim() || undefined,
					imageId,
				})
				form.reset()
				clearImage()
			} catch (_err) {
				// Error is handled by the mutation
			}
		},
	})

	const isSubmitting = createThing.isPending || generateUploadUrl.isPending

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Card className="col-span-1">
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
						className="space-y-4"
					>
						<Field>
							<FieldLabel>Image (optional)</FieldLabel>
							{imagePreview ? (
								<div className="relative">
									<img
										src={imagePreview}
										alt="Preview"
										className="h-32 w-full rounded-lg object-cover"
									/>
									<Button
										type="button"
										variant="destructive"
										size="sm"
										className="absolute top-2 right-2"
										onClick={clearImage}
										disabled={isSubmitting}
									>
										Remove
									</Button>
								</div>
							) : (
								<div
									className="border-muted-foreground/25 hover:border-muted-foreground/50 flex h-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed"
									onClick={() => fileInputRef.current?.click()}
								>
									<span className="text-muted-foreground text-sm">Click to upload image</span>
								</div>
							)}
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageSelect}
								disabled={isSubmitting}
								className="hidden"
							/>
						</Field>

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
										<Input
											id="title"
											type="text"
											placeholder="Enter thing title..."
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											disabled={isSubmitting}
										/>
										{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
											<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
										)}
									</Field>
								)}
							</form.Field>

							<form.Field
								name="description"
								validators={{
									onChange: ({ value }) => {
										if (!value) return undefined
										const result = createThingSchema.shape.description.safeParse(value)
										return result.success ? undefined : result.error.issues[0]?.message
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel htmlFor="description">Description (optional)</FieldLabel>
										<Textarea
											id="description"
											placeholder="Add a description..."
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											disabled={isSubmitting}
											rows={3}
										/>
										{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
											<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
										)}
									</Field>
								)}
							</form.Field>
						</FieldGroup>

						<form.Subscribe selector={(state) => state.values.title}>
							{(title) => (
								<Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full">
									{isSubmitting ? "Creating..." : "Create Thing"}
								</Button>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
			</Card>

			<Card className="col-span-1">
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
						<ul className="space-y-3">
							{(things as Thing[])?.map((thing) => (
								<ThingItem
									key={thing._id}
									thing={thing}
									onDelete={() => deleteThing.mutate({ id: thing._id })}
									onUpdate={(data) => updateThing.mutate({ id: thing._id, ...data })}
									isDeleting={deleteThing.isPending}
								/>
							))}
						</ul>
					)}
				</CardContent>
			</Card>
		</div>
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

			<main className="mx-auto flex w-full flex-col items-center gap-8">
				<ThingsManager />
			</main>

			<footer className="text-muted-foreground text-center text-sm">
				Powered by Convex + Better Auth + TanStack Query
			</footer>
		</div>
	)
}
