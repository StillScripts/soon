"use client"

import { useCallback, useState } from "react"

import { Button } from "@repo/ui/components/ui/button"
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@repo/ui/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@repo/ui/components/ui/field"
import { Input } from "@repo/ui/components/ui/input"
import { loginSchema, signupSchema } from "@repo/validators/auth"
import { useForm } from "@tanstack/react-form"

export type AuthMode = "login" | "signup"

export interface LoginData {
	email: string
	password: string
}

export interface SignupData {
	name: string
	email: string
	password: string
}

export interface AuthFormProps {
	/** Handler called on form submission with the validated data */
	onSubmit: (data: LoginData | SignupData, mode: AuthMode) => Promise<void>
	/** External error message to display (e.g., from server) */
	error?: string | null
	/** Initial mode for the form */
	initialMode?: AuthMode
}

const BUTTON_LABELS: Record<AuthMode, { idle: string; pending: string }> = {
	login: { idle: "Sign in", pending: "Signing in..." },
	signup: { idle: "Create account", pending: "Creating account..." },
}

export function AuthForm({ onSubmit, error: externalError, initialMode = "login" }: AuthFormProps) {
	const [mode, setMode] = useState<AuthMode>(initialMode)
	const [internalError, setInternalError] = useState<string | null>(null)
	const [isLoading, setIsLoading] = useState(false)

	const error = externalError ?? internalError

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
			name: "",
		},
		onSubmit: async ({ value }) => {
			setInternalError(null)
			setIsLoading(true)

			try {
				if (mode === "signup") {
					await onSubmit(
						{
							name: value.name,
							email: value.email,
							password: value.password,
						},
						mode
					)
				} else {
					await onSubmit(
						{
							email: value.email,
							password: value.password,
						},
						mode
					)
				}
			} catch (err) {
				setInternalError(err instanceof Error ? err.message : "An error occurred")
			} finally {
				setIsLoading(false)
			}
		},
	})

	const toggleMode = useCallback(() => {
		setMode((prev) => (prev === "login" ? "signup" : "login"))
		setInternalError(null)
	}, [])

	return (
		<Card className="w-full max-w-md">
			<CardHeader>
				<CardTitle>{mode === "login" ? "Welcome back" : "Create account"}</CardTitle>
				<CardDescription>
					{mode === "login" ? "Sign in to manage your things" : "Sign up to get started"}
				</CardDescription>
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
						{mode === "signup" && (
							<form.Field
								name="name"
								validators={{
									onChange: ({ value }) => {
										const result = signupSchema.shape.name.safeParse(value)
										return result.success ? undefined : result.error.issues[0]?.message
									},
								}}
							>
								{(field) => (
									<Field>
										<FieldLabel htmlFor="name">Name</FieldLabel>
										<Input
											id="name"
											type="text"
											placeholder="Your name"
											value={field.state.value}
											onChange={(e) => field.handleChange(e.target.value)}
											onBlur={field.handleBlur}
											disabled={isLoading}
										/>
										{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
											<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
										)}
									</Field>
								)}
							</form.Field>
						)}

						<form.Field
							name="email"
							validators={{
								onChange: ({ value }) => {
									const result = loginSchema.shape.email.safeParse(value)
									return result.success ? undefined : result.error.issues[0]?.message
								},
							}}
						>
							{(field) => (
								<Field>
									<FieldLabel htmlFor="email">Email</FieldLabel>
									<Input
										id="email"
										type="email"
										placeholder="you@example.com"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										disabled={isLoading}
									/>
									{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
										<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
									)}
								</Field>
							)}
						</form.Field>

						<form.Field
							name="password"
							validators={{
								onChange: ({ value }) => {
									const result = loginSchema.shape.password.safeParse(value)
									return result.success ? undefined : result.error.issues[0]?.message
								},
							}}
						>
							{(field) => (
								<Field>
									<FieldLabel htmlFor="password">Password</FieldLabel>
									<Input
										id="password"
										type="password"
										placeholder="••••••••"
										value={field.state.value}
										onChange={(e) => field.handleChange(e.target.value)}
										onBlur={field.handleBlur}
										disabled={isLoading}
									/>
									{field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
										<FieldError>{field.state.meta.errors.join(", ")}</FieldError>
									)}
								</Field>
							)}
						</form.Field>

						{error && <div className="text-destructive text-sm font-medium">{error}</div>}

						<Button type="submit" className="w-full" disabled={isLoading}>
							{BUTTON_LABELS[mode][isLoading ? "pending" : "idle"]}
						</Button>
					</FieldGroup>
				</form>

				<div className="mt-4 text-center text-sm">
					{mode === "login" ? (
						<>
							Don&apos;t have an account?{" "}
							<button
								type="button"
								onClick={toggleMode}
								className="text-primary hover:text-primary/80 underline underline-offset-4"
							>
								Sign up
							</button>
						</>
					) : (
						<>
							Already have an account?{" "}
							<button
								type="button"
								onClick={toggleMode}
								className="text-primary hover:text-primary/80 underline underline-offset-4"
							>
								Sign in
							</button>
						</>
					)}
				</div>
			</CardContent>
		</Card>
	)
}
