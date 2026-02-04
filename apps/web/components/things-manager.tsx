// oxlint-disable nextjs/no-img-element
"use client"

import { useRef, useState } from "react"

import { type Thing, useThings, useThingsGenerateUploadUrl } from "@repo/api/things"
import { ThingForm, type ThingFormData } from "@repo/forms/thing"
import { Button } from "@repo/ui/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/ui/card"
import { Field, FieldLabel } from "@repo/ui/components/ui/field"

import { useCRPC } from "@/lib/convex/crpc"

/**
 * Upload a file to Convex storage and return the storage ID.
 */
async function uploadFileToStorage(file: File, getUploadUrl: () => Promise<string>) {
	const uploadUrl = await getUploadUrl()
	const result = await fetch(uploadUrl, {
		method: "POST",
		headers: { "Content-Type": file.type },
		body: file,
	})
	const { storageId } = await result.json()
	return storageId as string
}

function ImageUpload({
	imageUrl,
	onUpload,
	onRemove,
	disabled,
	label,
}: {
	imageUrl: string | null
	onUpload: (file: File) => Promise<void>
	onRemove: () => void
	disabled?: boolean
	label?: string
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
		<Field>
			{label && <FieldLabel>{label}</FieldLabel>}
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
		</Field>
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

	const generateUploadUrl = useThingsGenerateUploadUrl(crpc)

	const handleImageUpload = async (file: File) => {
		const storageId = await uploadFileToStorage(file, () => generateUploadUrl.mutateAsync())
		setEditImageId(storageId)
		setEditImageUrl(URL.createObjectURL(file))
	}

	const handleSubmit = async (data: ThingFormData) => {
		onUpdate({
			title: data.title,
			description: data.description || null,
			imageId: editImageId ?? null,
		})
		setIsEditing(false)
	}

	if (isEditing) {
		return (
			<li className="bg-secondary rounded-lg p-4">
				<ThingForm
					onSubmit={handleSubmit}
					defaultValues={{
						title: thing.title,
						description: thing.description ?? "",
					}}
					idPrefix={`edit-${thing._id}`}
					onCancel={() => setIsEditing(false)}
					imageSlot={
						<ImageUpload
							imageUrl={editImageUrl}
							onUpload={handleImageUpload}
							onRemove={() => {
								setEditImageId(undefined)
								setEditImageUrl(null)
							}}
						/>
					}
				/>
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
						className="h-16 w-16 shrink-0 rounded-lg object-cover"
					/>
				)}
				<div className="flex min-w-0 flex-1 items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<p className="font-medium">{thing.title}</p>
						{thing.description && (
							<p className="text-muted-foreground mt-1 text-sm">{thing.description}</p>
						)}
					</div>
					<div className="flex shrink-0 items-center gap-2">
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
			</div>
		</li>
	)
}

function ThingsList({
	things,
	isLoading,
	error,
	onDelete,
	onUpdate,
	isDeleting,
}: {
	things: Thing[] | undefined
	isLoading: boolean
	error: Error | null
	onDelete: (id: string) => void
	onUpdate: (
		id: string,
		data: { title?: string; description?: string | null; imageId?: string | null }
	) => void
	isDeleting: boolean
}) {
	if (isLoading) {
		return <p className="text-muted-foreground">Loading...</p>
	}

	if (error) {
		return <p className="text-destructive">Error loading things</p>
	}

	if (!things || things.length === 0) {
		return <p className="text-muted-foreground">No things yet. Create one above!</p>
	}

	return (
		<ul className="space-y-3">
			{things.map((thing) => (
				<ThingItem
					key={thing._id}
					thing={thing}
					onDelete={() => onDelete(thing._id)}
					onUpdate={(data) => onUpdate(thing._id, data)}
					isDeleting={isDeleting}
				/>
			))}
		</ul>
	)
}

/**
 * Client component for managing Things with CRUD operations.
 * Data is prefetched on the server and hydrated for instant display.
 */
export function ThingsManager() {
	const crpc = useCRPC()
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)

	const {
		things,
		isLoading,
		error,
		create: createThing,
		update: updateThing,
		remove: deleteThing,
		generateUploadUrl,
	} = useThings(crpc)

	const handleImageUpload = async (file: File) => {
		setImageFile(file)
		setImagePreview(URL.createObjectURL(file))
	}

	const clearImage = () => {
		setImageFile(null)
		setImagePreview(null)
	}

	const isSubmitting = createThing.isPending || generateUploadUrl.isPending

	const handleSubmit = async (data: ThingFormData) => {
		const imageId = imageFile
			? await uploadFileToStorage(imageFile, () => generateUploadUrl.mutateAsync())
			: undefined

		await createThing.mutateAsync({
			title: data.title,
			description: data.description || undefined,
			imageId,
		})
	}

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<Card className="col-span-1">
				<CardHeader>
					<CardTitle>Create a Thing</CardTitle>
				</CardHeader>
				<CardContent>
					<ThingForm
						onSubmit={handleSubmit}
						isSubmitting={isSubmitting}
						submitLabel="Create Thing"
						submittingLabel="Creating..."
						onReset={clearImage}
						imageSlot={
							<ImageUpload
								imageUrl={imagePreview}
								onUpload={handleImageUpload}
								onRemove={clearImage}
								disabled={isSubmitting}
								label="Image (optional)"
							/>
						}
					/>
				</CardContent>
			</Card>

			<Card className="col-span-1">
				<CardHeader>
					<CardTitle>Your Things</CardTitle>
				</CardHeader>
				<CardContent>
					<ThingsList
						things={things}
						isLoading={isLoading}
						error={error}
						onDelete={(id) => deleteThing.mutate({ id })}
						onUpdate={(id, data) => updateThing.mutate({ id, ...data })}
						isDeleting={deleteThing.isPending}
					/>
				</CardContent>
			</Card>
		</div>
	)
}
