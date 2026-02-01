import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Mock } from "vitest"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
	AuthForm,
	type AuthFormProps,
	type AuthMode,
	type LoginData,
	type SignupData,
} from "./auth-form"

describe("AuthForm", () => {
	let mockOnSubmit: Mock<AuthFormProps["onSubmit"]>

	beforeEach(() => {
		mockOnSubmit = vi.fn()
	})

	afterEach(() => {
		cleanup()
		vi.clearAllMocks()
	})

	describe("rendering", () => {
		it("renders login mode by default", () => {
			render(<AuthForm onSubmit={mockOnSubmit} />)

			expect(screen.getByText("Welcome back")).toBeInTheDocument()
			expect(screen.getByText("Sign in to manage your things")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument()
			expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
		})

		it("renders email and password fields", () => {
			render(<AuthForm onSubmit={mockOnSubmit} />)

			expect(screen.getByLabelText("Email")).toBeInTheDocument()
			expect(screen.getByLabelText("Password")).toBeInTheDocument()
		})

		it("renders signup mode when initialMode is signup", () => {
			render(<AuthForm onSubmit={mockOnSubmit} initialMode="signup" />)

			expect(screen.getByText("Sign up to get started")).toBeInTheDocument()
			expect(screen.getByRole("button", { name: "Create account" })).toBeInTheDocument()
			expect(screen.getByLabelText("Name")).toBeInTheDocument()
		})

		it("renders signup mode when toggled", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

			const signUpLink = screen.getByText("Sign up")
			await user.click(signUpLink)

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
			render(<AuthForm onSubmit={mockOnSubmit} />)

			expect(screen.getByText("Welcome back")).toBeInTheDocument()

			await user.click(screen.getByText("Sign up"))

			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})
		})

		it("toggles from signup back to login", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.click(screen.getByText("Sign up"))
			await waitFor(() => {
				expect(screen.getByLabelText("Name")).toBeInTheDocument()
			})

			await user.click(screen.getByText("Sign in"))
			await waitFor(() => {
				expect(screen.queryByLabelText("Name")).not.toBeInTheDocument()
			})
		})
	})

	describe("email validation", () => {
		it("shows error when email is cleared", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText("Email")
			await user.type(emailInput, "a")
			await user.clear(emailInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Email is required")).toBeInTheDocument()
			})
		})

		it("shows error for invalid email format", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

			const emailInput = screen.getByLabelText("Email")
			await user.type(emailInput, "invalid-email")
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Invalid email")).toBeInTheDocument()
			})
		})

		it("accepts valid email format", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

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
			render(<AuthForm onSubmit={mockOnSubmit} />)

			const passwordInput = screen.getByLabelText("Password")
			await user.type(passwordInput, "a")
			await user.clear(passwordInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Password is required")).toBeInTheDocument()
			})
		})

		it("shows error when password is too short", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

			const passwordInput = screen.getByLabelText("Password")
			await user.type(passwordInput, "short")
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument()
			})
		})

		it("accepts password with 8 or more characters", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} />)

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
			render(<AuthForm onSubmit={mockOnSubmit} initialMode="signup" />)

			const nameInput = screen.getByLabelText("Name")
			await user.type(nameInput, "a")
			await user.clear(nameInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Name is required")).toBeInTheDocument()
			})
		})

		it("accepts valid name in signup mode", async () => {
			const user = userEvent.setup()
			render(<AuthForm onSubmit={mockOnSubmit} initialMode="signup" />)

			const nameInput = screen.getByLabelText("Name")
			await user.type(nameInput, "John Doe")
			await user.tab()

			await waitFor(() => {
				expect(screen.queryByText("Name is required")).not.toBeInTheDocument()
			})
		})
	})

	describe("form submission - login", () => {
		it("calls onSubmit with valid credentials", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockResolvedValue(undefined)

			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith(
					{
						email: "test@example.com",
						password: "password123",
					} satisfies LoginData,
					"login" satisfies AuthMode
				)
			})
		})

		it("displays external error message", async () => {
			render(<AuthForm onSubmit={mockOnSubmit} error="Invalid credentials" />)

			expect(screen.getByText("Invalid credentials")).toBeInTheDocument()
		})

		it("shows loading state during submission", async () => {
			const user = userEvent.setup()
			let resolvePromise: (value: void) => void
			mockOnSubmit.mockReturnValue(
				new Promise<void>((resolve) => {
					resolvePromise = resolve
				})
			)

			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			expect(screen.getByRole("button", { name: "Signing in..." })).toBeDisabled()

			resolvePromise!()
		})
	})

	describe("form submission - signup", () => {
		it("calls onSubmit with valid credentials", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockResolvedValue(undefined)

			render(<AuthForm onSubmit={mockOnSubmit} initialMode="signup" />)

			await user.type(screen.getByLabelText("Name"), "John Doe")
			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Create account" }))

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith(
					{
						name: "John Doe",
						email: "test@example.com",
						password: "password123",
					} satisfies SignupData,
					"signup" satisfies AuthMode
				)
			})
		})

		it("shows loading state during submission", async () => {
			const user = userEvent.setup()
			let resolvePromise: (value: void) => void
			mockOnSubmit.mockReturnValue(
				new Promise<void>((resolve) => {
					resolvePromise = resolve
				})
			)

			render(<AuthForm onSubmit={mockOnSubmit} initialMode="signup" />)

			await user.type(screen.getByLabelText("Name"), "John Doe")
			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Create account" }))

			expect(screen.getByRole("button", { name: "Creating account..." })).toBeDisabled()

			resolvePromise!()
		})
	})

	describe("error handling", () => {
		it("handles thrown errors during submission", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockRejectedValue(new Error("Network error"))

			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("Network error")).toBeInTheDocument()
			})
		})

		it("handles non-Error thrown objects", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockRejectedValue("string error")

			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("An error occurred")).toBeInTheDocument()
			})
		})

		it("clears internal error when switching modes", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockRejectedValue(new Error("Network error"))

			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			await waitFor(() => {
				expect(screen.getByText("Network error")).toBeInTheDocument()
			})

			await user.click(screen.getByRole("button", { name: "Sign up" }))

			expect(screen.queryByText("Network error")).not.toBeInTheDocument()
		})

		it("external error takes precedence over internal error", async () => {
			render(<AuthForm onSubmit={mockOnSubmit} error="External error" />)

			expect(screen.getByText("External error")).toBeInTheDocument()
		})
	})

	describe("input states", () => {
		it("disables inputs during loading", async () => {
			const user = userEvent.setup()
			let resolvePromise: (value: void) => void
			mockOnSubmit.mockReturnValue(
				new Promise<void>((resolve) => {
					resolvePromise = resolve
				})
			)

			render(<AuthForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Email"), "test@example.com")
			await user.type(screen.getByLabelText("Password"), "password123")
			await user.click(screen.getByRole("button", { name: "Sign in" }))

			expect(screen.getByLabelText("Email")).toBeDisabled()
			expect(screen.getByLabelText("Password")).toBeDisabled()

			resolvePromise!()
		})
	})
})
