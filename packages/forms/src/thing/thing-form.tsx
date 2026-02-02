"use client"

import { useEffect } from "react"

import { Button } from "@repo/ui/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field"
import { Input } from "@repo/ui/components/ui/input"
import { Textarea } from "@repo/ui/components/ui/textarea"
import { thingInputSchema } from "@repo/validators/things"
import { useForm } from "@tanstack/react-form"

export interface ThingFormData {
	title: string
	description: string
}

export interface ThingFormProps {
	/** Handler called on form submission with the validated data */
	onSubmit: (data: ThingFormData) => Promise<void>
	/** Default values for the form fields */
	defaultValues?: Partial<ThingFormData>
	/** Whether the form is currently submitting */
	isSubmitting?: boolean
	/** Label for the submit button */
	submitLabel?: string
	/** Label shown while submitting */
	submittingLabel?: string
	/** ID prefix for form fields (useful when multiple forms on page) */
	idPrefix?: string
	/** Optional slot for rendering image upload above the fields */
	imageSlot?: React.ReactNode
	/** Called when form is reset after successful submission */
	onReset?: () => void
	/** Optional cancel handler (shows cancel button if provided) */
	onCancel?: () => void
}

export function ThingForm({
	onSubmit,
	defaultValues,
	isSubmitting = false,
	submitLabel = "Save",
	submittingLabel = "Saving...",
	idPrefix = "",
	imageSlot,
	onReset,
	onCancel,
}: ThingFormProps) {
	const form = useForm({
		defaultValues: {
			title: defaultValues?.title ?? "",
			description: defaultValues?.description ?? "",
		},
		onSubmit: async ({ value }) => {
			await onSubmit({
				title: value.title.trim(),
				description: value.description.trim(),
			})
			if (!defaultValues) {
				form.reset()
				onReset?.()
			}
		},
	})

	// Reset form when defaultValues change (for edit mode)
	useEffect(() => {
		if (defaultValues) {
			form.reset()
		}
	}, [defaultValues?.title, defaultValues?.description])

	const titleId = idPrefix ? `${idPrefix}-title` : "title"
	const descriptionId = idPrefix ? `${idPrefix}-description` : "description"

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
			className="space-y-4"
		>
			{imageSlot}

			<FieldGroup>
				<form.Field
					name="title"
					validators={{
						onChange: ({ value }) => {
							const result = thingInputSchema.shape.title.safeParse(value)
							return result.success ? undefined : result.error.issues[0]?.message
						},
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor={titleId}>Title</FieldLabel>
							<Input
								id={titleId}
								type="text"
								placeholder="Enter title..."
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
							const result = thingInputSchema.shape.description.safeParse(value)
							return result.success ? undefined : result.error.issues[0]?.message
						},
					}}
				>
					{(field) => (
						<Field>
							<FieldLabel htmlFor={descriptionId}>
								Description {!defaultValues && "(optional)"}
							</FieldLabel>
							<Textarea
								id={descriptionId}
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

			{onCancel ? (
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={onCancel}
						disabled={isSubmitting}
					>
						Cancel
					</Button>
					<form.Subscribe selector={(state) => state.values.title}>
						{(title) => (
							<Button type="submit" size="sm" disabled={isSubmitting || !title.trim()}>
								{isSubmitting ? submittingLabel : submitLabel}
							</Button>
						)}
					</form.Subscribe>
				</div>
			) : (
				<form.Subscribe selector={(state) => state.values.title}>
					{(title) => (
						<Button type="submit" disabled={isSubmitting || !title.trim()} className="w-full">
							{isSubmitting ? submittingLabel : submitLabel}
						</Button>
					)}
				</form.Subscribe>
			)}
		</form>
	)
}
