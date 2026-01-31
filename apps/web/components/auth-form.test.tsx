import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Import the mocked module for assertions
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

describe("AuthForm", () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	afterEach(() => {
		cleanup()
	})

	describe("rendering", () => {
		it("renders login mode by default", () => {
			render(<AuthForm />)

			expect(screen.getByText("Welcome back")).toBeInTheDocument()
			expect(screen.getByText("Sign in to manage your things")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument()
			expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
		})

		it("renders email and password fields", () => {
			render(<AuthForm />)

			expect(screen.getByLabelText("Email")).toBeInTheDocument()
			expect(screen.getByLabelText("Password")).toBeInTheDocument()
		})

		it("renders signup mode when toggled", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			// The "Sign up" link at the bottom toggles mode
			const signUpLink = screen.getByText("Sign up")
			await user.click(signUpLink)

			// Wait for name input to appear (indicates signup mode)
			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})
			expect(screen.getByText("Sign up to get started")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument()
		})
	})

	describe("mode switching", () => {
		it("toggles from login to signup", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			expect(screen.getByText("Welcome back")).toBeInTheDocument()

			// Click the "Sign up" link at the bottom
			await user.click(screen.getByText("Sign up"))

			// Wait for name input to appear (indicates signup mode)
			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})
		})

		it("toggles from signup back to login", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			// Switch to signup
			await user.click(screen.getByText("Sign up"))
			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})

			// Switch back to login - now there's a "Sign in" link at the bottom
			await user.click(screen.getByText("Sign in"))
			await waitFor(() => {
				expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
			})
		})
	})

	describe("email validation", () => {
		it("shows error when email is cleared", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			const emailInput = screen.getByLabelText("Email")
			// Type something then clear it to trigger onChange validation
			await user.type(emailInput, "a")
			await user.clear(emailInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Email is required")).toBeInTheDocument()
			})
		})

		it("shows error for invalid email format", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			const emailInput = screen.getByLabelText("Email")
			await user.type(emailInput, "invalid-email")
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Invalid email")).toBeInTheDocument()
			})
		})

		it("accepts valid email format", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			const emailInput = screen.getByLabelText("Email")
			await user.type(emailInput, "test@example.com")
			await user.tab()

			await waitFor(() => {
				expect(screen.queryByText("Email is required")).not.toBeInTheDocument()
				expect(screen.queryByText("Invalid email")).not.toBeInTheDocument()
			})
		})
	})

	describe("password validation", () => {
		it("shows error when password is cleared", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			const passwordInput = screen.getByLabelText("Password")
			// Type something then clear it to trigger onChange validation
			await user.type(passwordInput, "a")
			await user.clear(passwordInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Password is required")).toBeInTheDocument()
			})
		})

		it("shows error when password is too short", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			const passwordInput = screen.getByLabelText("Password")
			await user.type(passwordInput, "short")
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
			})
		})

		it("accepts password with 8 or more characters", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			const passwordInput = screen.getByLabelText("Password")
			await user.type(passwordInput, "validpassword123")
			await user.tab()

			await waitFor(() => {
				expect(screen.queryByText("Password is required")).not.toBeInTheDocument()
				expect(screen.queryByText("Password must be at least 8 characters")).not.toBeInTheDocument()
			})
		})
	})

	describe("name validation (signup mode)", () => {
		it("shows error when name is cleared in signup mode", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			// Switch to signup mode
			await user.click(screen.getByText("Sign up"))
			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})

			const nameInput = screen.getByLabelText("Name")
			// Type something then clear it to trigger onChange validation
			await user.type(nameInput, "a")
			await user.clear(nameInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Name is required")).toBeInTheDocument()
			})
		})

		it("accepts valid name in signup mode", async () => {
			const user = userEvent.setup()
			render(<AuthForm />)

			// Switch to signup mode
			await user.click(screen.getByText("Sign up"))
			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})

			const nameInput = screen.getByLabelText("Name")
			await user.type(nameInput, "John Doe")
			await user.tab()

			await waitFor(() => {
				expect(screen.queryByText("Name is required")).not.toBeInTheDocument()
			})
		})
	})

	describe("form submission - login", () => {
		it("calls signIn.email with valid credentials", async () => {
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

		it("shows error message on login failure", async () => {
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

		it("shows default error message when no message provided", async () => {
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

		it("shows loading state during submission", async () => {
			const user = userEvent.setup()
			let resolvePromise: (value: unknown) => void
			vi.mocked(authClient.signIn.email).mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve
				}) as never
			)

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled()

			// Resolve the promise to clean up
			resolvePromise!({ data: {} })
		})
	})

	describe("form submission - signup", () => {
		it("calls signUp.email with valid credentials", async () => {
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

		it("shows error message on signup failure", async () => {
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

		it("shows default error message when no message provided", async () => {
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

		it("shows loading state during submission", async () => {
			const user = userEvent.setup()
			let resolvePromise: (value: unknown) => void
			vi.mocked(authClient.signUp.email).mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve
				}) as never
			)

			render(<AuthForm />)

			// Switch to signup mode
			await user.click(screen.getByRole("button", { name: "Sign up" }))

			await user.type(screen.getByLabelText("Name"), "John Doe")
			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Create account" }))

			expect(screen.getByRole("button", { name: "Creating account..." })).toBeDisabled()

			// Resolve the promise to clean up
			resolvePromise!({ data: {} })
		})
	})

	describe("error handling", () => {
		it("handles thrown errors during login", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signIn.email).mockRejectedValue(new Error("Network error"))

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("Network error")).toBeInTheDocument()
			})
		})

		it("handles non-Error thrown objects", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signIn.email).mockRejectedValue("string error")

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("An error occurred")).toBeInTheDocument()
			})
		})

		it("clears error when switching modes", async () => {
			const user = userEvent.setup()
			vi.mocked(authClient.signIn.email).mockResolvedValue({
				error: { message: "Invalid credentials" },
			} as never)

			render(<AuthForm />)

			// Trigger an error
			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "wrongpassword")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
			})

			// Switch modes
			await user.click(screen.getByRole("button", { name: "Sign up" }))

			expect(screen.queryByText("Invalid credentials")).not.toBeInTheDocument()
		})
	})

	describe("input states", () => {
		it("disables inputs during loading", async () => {
			const user = userEvent.setup()
			let resolvePromise: (value: unknown) => void
			vi.mocked(authClient.signIn.email).mockReturnValue(
				new Promise((resolve) => {
					resolvePromise = resolve
				}) as never
			)

			render(<AuthForm />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			expect(screen.getByLabelText("Email")).toBeDisabled()
			expect(screen.getByLabelText("Password")).toBeDisabled()

			// Resolve the promise to clean up
			resolvePromise!({ data: {} })
		})
	})
})
