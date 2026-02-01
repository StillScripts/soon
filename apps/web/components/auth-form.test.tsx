import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { authClient } from "@/lib/auth-client"

import { AuthForm } from "./auth-form"

// Mock the auth client
vi.mock("@/lib/auth-client", () => ({
	authClient: {
		signIn: {
			email: vi.fn(),
		},
		signUp: {
			email: vi.fn(),
		},
	},
}))

describe("AuthForm Integration", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		cleanup()
	})

	describe("login", () => {
		it("calls authClient.signIn.email on login submission", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signIn.email).mockResolvedValue({ data: { session: {} } } as never)

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(authClient.signIn.email).toHaveBeenCalledWith({
					email: "test@example.com",
					password: "password123",
				})
			})
		})

		it("displays error message when login fails", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: { message: "Invalid credentials" },
			} as never)

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "wrongpassword")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
			})
		})

		it("displays default error message when login fails without message", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: {},
			} as never)

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("Login failed")).toBeInTheDocument()
			})
		})
	})

	describe("signup", () => {
		it("calls authClient.signUp.email on signup submission", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signUp.email).mockResolvedValue({ data: { session: {} } } as never)

			render(<AuthForm />)

			// Switch to signup mode
			await user.click(screen.getByRole("button", { name: "Sign up" }))

			await user.type(screen.getByLabelText("Name"), "John Doe")
			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Create account" }))

			await waitFor(() => {
				expect(authClient.signUp.email).toHaveBeenCalledWith({
					email: "test@example.com",
					password: "password123",
					name: "John Doe",
				})
			})
		})

		it("displays error message when signup fails", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signUp.email).mockResolvedValue({
				error: { message: "Email already exists" },
			} as never)

			render(<AuthForm />)

			// Switch to signup mode
			await user.click(screen.getByRole("button", { name: "Sign up" }))

			await user.type(screen.getByLabelText("Name"), "John Doe")
			await user.type(screen.getByLabelText("Email"), "existing@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Create account" }))

			await waitFor(() => {
				expect(screen.getByText("Email already exists")).toBeInTheDocument()
			})
		})

		it("displays default error message when signup fails without message", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signUp.email).mockResolvedValue({
				error: {},
			} as never)

			render(<AuthForm />)

			// Switch to signup mode
			await user.click(screen.getByRole("button", { name: "Sign up" }))

			await user.type(screen.getByLabelText("Name"), "John Doe")
			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Create account" }))

			await waitFor(() => {
				expect(screen.getByText("Sign up failed")).toBeInTheDocument()
			})
		})
	})
})
