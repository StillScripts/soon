"use client"

import { useState } from "react"

import {
	AuthForm as AuthFormBase,
	type AuthMode,
	type LoginData,
	type SignupData,
} from "@repo/forms/auth"

import { authClient } from "@/lib/auth-client"

export function AuthForm() {
	const [error, setError] = useState<string | null>(null)

	const handleSubmit = async (data: LoginData | SignupData, mode: AuthMode) => {
		setError(null)

		if (mode === "signup") {
			const signupData = data as SignupData
			const result = await authClient.signUp.email({
				email: signupData.email,
				password: signupData.password,
				name: signupData.name,
			})
			if (result.error) {
				throw new Error(result.error.message || "Sign up failed")
			}
		} else {
			const loginData = data as LoginData
			const result = await authClient.signIn.email({
				email: loginData.email,
				password: loginData.password,
			})
			if (result.error) {
				throw new Error(result.error.message || "Login failed")
			}
		}
	}

	return <AuthFormBase onSubmit={handleSubmit} error={error} />
}
