import { z } from "zod"

/**
 * Shared Zod Validation Schemas for Authentication
 *
 * These schemas are used by the forms package for client-side validation
 * and can be reused on the server for API validation.
 */

/**
 * Email validation schema
 */
export const emailSchema = z.string().min(1, "Email is required").email("Invalid email")

/**
 * Password validation schema
 */
export const passwordSchema = z
	.string()
	.min(1, "Password is required")
	.min(8, "Password must be at least 8 characters")

/**
 * Name validation schema (for signup)
 */
export const nameSchema = z.string().min(1, "Name is required")

/**
 * Schema for login
 */
export const loginSchema = z.object({
	email: emailSchema,
	password: passwordSchema,
})

/**
 * Schema for signup
 */
export const signupSchema = z.object({
	name: nameSchema,
	email: emailSchema,
	password: passwordSchema,
})

/**
 * Type inference helpers
 */
export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
