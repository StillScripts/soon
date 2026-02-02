import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import type { Mock } from "vitest"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { ThingForm, type ThingFormProps } from "./thing-form"

describe("ThingForm", () => {
	let mockOnSubmit: Mock<ThingFormProps["onSubmit"]>

	beforeEach(() => {
		mockOnSubmit = vi.fn()
	})

	afterEach(() => {
		cleanup()
		vi.clearAllMocks()
	})

	describe("rendering", () => {
		it("renders title and description fields", () => {
			render(<ThingForm onSubmit={mockOnSubmit} />)

			expect(screen.getByLabelText("Title")).toBeInTheDocument()
			expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
		})

		it("renders submit button with default label", () => {
			render(<ThingForm onSubmit={mockOnSubmit} />)

			expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument()
		})

		it("renders submit button with custom label", () => {
			render(<ThingForm onSubmit={mockOnSubmit} submitLabel="Create Thing" />)

			expect(screen.getByRole("button", { name: "Create Thing" })).toBeInTheDocument()
		})

		it("renders cancel button when onCancel is provided", () => {
			const onCancel = vi.fn()
			render(<ThingForm onSubmit={mockOnSubmit} onCancel={onCancel} />)

			expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument()
		})

		it("does not render cancel button when onCancel is not provided", () => {
			render(<ThingForm onSubmit={mockOnSubmit} />)

			expect(screen.queryByRole("button", { name: "Cancel" })).not.toBeInTheDocument()
		})

		it("renders image slot when provided", () => {
			render(
				<ThingForm
					onSubmit={mockOnSubmit}
					imageSlot={<div data-testid="image-slot">Image Upload</div>}
				/>
			)

			expect(screen.getByTestId("image-slot")).toBeInTheDocument()
		})

		it("uses custom id prefix for fields", () => {
			render(<ThingForm onSubmit={mockOnSubmit} idPrefix="edit" />)

			expect(screen.getByLabelText("Title")).toHaveAttribute("id", "edit-title")
			expect(screen.getByLabelText(/Description/)).toHaveAttribute("id", "edit-description")
		})
	})

	describe("default values", () => {
		it("populates fields with default values", () => {
			render(
				<ThingForm
					onSubmit={mockOnSubmit}
					defaultValues={{ title: "My Thing", description: "A description" }}
				/>
			)

			expect(screen.getByLabelText("Title")).toHaveValue("My Thing")
			expect(screen.getByLabelText(/Description/)).toHaveValue("A description")
		})

		it("shows (optional) on description when no default values", () => {
			render(<ThingForm onSubmit={mockOnSubmit} />)

			expect(screen.getByText(/Description.*\(optional\)/)).toBeInTheDocument()
		})

		it("does not show (optional) on description when default values provided", () => {
			render(
				<ThingForm onSubmit={mockOnSubmit} defaultValues={{ title: "Test", description: "" }} />
			)

			expect(screen.queryByText(/\(optional\)/)).not.toBeInTheDocument()
		})
	})

	describe("validation", () => {
		it("shows error when title is empty", async () => {
			const user = userEvent.setup()
			render(<ThingForm onSubmit={mockOnSubmit} />)

			const titleInput = screen.getByLabelText("Title")
			await user.type(titleInput, "a")
			await user.clear(titleInput)
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Title is required")).toBeInTheDocument()
			})
		})

		it("shows error when title exceeds max length", async () => {
			const user = userEvent.setup()
			render(<ThingForm onSubmit={mockOnSubmit} />)

			const titleInput = screen.getByLabelText("Title")
			await user.type(titleInput, "a".repeat(201))
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Title must be 200 characters or less")).toBeInTheDocument()
			})
		})

		it("accepts valid title", async () => {
			const user = userEvent.setup()
			render(<ThingForm onSubmit={mockOnSubmit} />)

			const titleInput = screen.getByLabelText("Title")
			await user.type(titleInput, "Valid Title")
			await user.tab()

			await waitFor(() => {
				expect(screen.queryByText(/Title is required/)).not.toBeInTheDocument()
				expect(screen.queryByText(/200 characters/)).not.toBeInTheDocument()
			})
		})

		it("shows error when description exceeds max length", async () => {
			const user = userEvent.setup()
			render(<ThingForm onSubmit={mockOnSubmit} />)

			const descInput = screen.getByLabelText(/Description/)
			await user.type(descInput, "a".repeat(2001))
			await user.tab()

			await waitFor(() => {
				expect(screen.getByText("Description must be 2000 characters or less")).toBeInTheDocument()
			})
		})

		it("submit button is disabled when title is empty", () => {
			render(<ThingForm onSubmit={mockOnSubmit} />)

			expect(screen.getByRole("button", { name: "Save" })).toBeDisabled()
		})

		it("submit button is enabled when title has value", async () => {
			const user = userEvent.setup()
			render(<ThingForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Title"), "Test")

			expect(screen.getByRole("button", { name: "Save" })).toBeEnabled()
		})
	})

	describe("submission", () => {
		it("calls onSubmit with trimmed values", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockResolvedValue(undefined)

			render(<ThingForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Title"), "  My Title  ")
			await user.type(screen.getByLabelText(/Description/), "  My Description  ")
			await user.click(screen.getByRole("button", { name: "Save" }))

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalledWith({
					title: "My Title",
					description: "My Description",
				})
			})
		})

		it("resets form after successful submission (create mode)", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockResolvedValue(undefined)

			render(<ThingForm onSubmit={mockOnSubmit} />)

			await user.type(screen.getByLabelText("Title"), "Test Title")
			await user.click(screen.getByRole("button", { name: "Save" }))

			await waitFor(() => {
				expect(screen.getByLabelText("Title")).toHaveValue("")
			})
		})

		it("does not reset form after submission when defaultValues provided (edit mode)", async () => {
			const user = userEvent.setup()
			mockOnSubmit.mockResolvedValue(undefined)

			render(
				<ThingForm onSubmit={mockOnSubmit} defaultValues={{ title: "Original", description: "" }} />
			)

			await user.clear(screen.getByLabelText("Title"))
			await user.type(screen.getByLabelText("Title"), "Updated")
			await user.click(screen.getByRole("button", { name: "Save" }))

			await waitFor(() => {
				expect(mockOnSubmit).toHaveBeenCalled()
			})

			// In edit mode, form keeps the values
			expect(screen.getByLabelText("Title")).toHaveValue("Updated")
		})

		it("calls onReset after successful submission", async () => {
			const user = userEvent.setup()
			const onReset = vi.fn()
			mockOnSubmit.mockResolvedValue(undefined)

			render(<ThingForm onSubmit={mockOnSubmit} onReset={onReset} />)

			await user.type(screen.getByLabelText("Title"), "Test")
			await user.click(screen.getByRole("button", { name: "Save" }))

			await waitFor(() => {
				expect(onReset).toHaveBeenCalled()
			})
		})
	})

	describe("loading state", () => {
		it("shows submitting label when isSubmitting is true", () => {
			render(<ThingForm onSubmit={mockOnSubmit} isSubmitting submittingLabel="Creating..." />)

			expect(screen.getByRole("button", { name: "Creating..." })).toBeInTheDocument()
		})

		it("disables inputs when isSubmitting is true", () => {
			render(<ThingForm onSubmit={mockOnSubmit} isSubmitting />)

			expect(screen.getByLabelText("Title")).toBeDisabled()
			expect(screen.getByLabelText(/Description/)).toBeDisabled()
		})

		it("disables submit button when isSubmitting is true", () => {
			render(<ThingForm onSubmit={mockOnSubmit} isSubmitting defaultValues={{ title: "Test" }} />)

			expect(screen.getByRole("button", { name: "Saving..." })).toBeDisabled()
		})

		it("disables cancel button when isSubmitting is true", () => {
			render(<ThingForm onSubmit={mockOnSubmit} isSubmitting onCancel={vi.fn()} />)

			expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled()
		})
	})

	describe("cancel action", () => {
		it("calls onCancel when cancel button is clicked", async () => {
			const user = userEvent.setup()
			const onCancel = vi.fn()

			render(<ThingForm onSubmit={mockOnSubmit} onCancel={onCancel} />)

			await user.click(screen.getByRole("button", { name: "Cancel" }))

			expect(onCancel).toHaveBeenCalled()
		})
	})
})
