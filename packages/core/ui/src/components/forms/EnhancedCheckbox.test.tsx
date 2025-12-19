import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { EnhancedCheckbox } from "./EnhancedCheckbox";

describe("EnhancedCheckbox", () => {
    describe("Rendering", () => {
        it("should render checkbox with label", () => {
            render(<EnhancedCheckbox label="Accept terms" />);

            expect(screen.getByLabelText("Accept terms")).toBeInTheDocument();
        });

        it("should render without label", () => {
            render(<EnhancedCheckbox data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            expect(checkbox).toBeInTheDocument();
        });

        it("should render with helper text", () => {
            render(<EnhancedCheckbox label="Subscribe" helperText="Receive newsletter updates" />);

            expect(screen.getByText("Receive newsletter updates")).toBeInTheDocument();
        });

        it("should render with error message", () => {
            render(<EnhancedCheckbox label="Agree" error="You must agree to continue" />);

            expect(screen.getByText("You must agree to continue")).toBeInTheDocument();
        });

        it("should apply custom className", () => {
            render(<EnhancedCheckbox label="Checkbox" className="custom-class" data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            expect(checkbox.className).toContain("custom-class");
        });
    });

    describe("Checked State", () => {
        it("should render as unchecked by default", () => {
            render(<EnhancedCheckbox label="Option" data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.checked).toBe(false);
        });

        it("should render as checked when checked prop is true", () => {
            render(<EnhancedCheckbox label="Option" checked data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.checked).toBe(true);
        });

        it("should call onChange when clicked", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<EnhancedCheckbox label="Option" onChange={handleChange} data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            await user.click(checkbox);

            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it("should toggle checked state when clicked", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn((e) => e.target.checked);

            render(<EnhancedCheckbox label="Option" onChange={handleChange} data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");

            await user.click(checkbox);
            expect(handleChange).toHaveReturnedWith(true);

            await user.click(checkbox);
            expect(handleChange).toHaveReturnedWith(false);
        });
    });

    describe("Indeterminate State", () => {
        it("should set indeterminate property when indeterminate prop is true", () => {
            render(<EnhancedCheckbox label="Option" indeterminate data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.indeterminate).toBe(true);
        });

        it("should remove indeterminate when prop changes to false", () => {
            const { rerender } = render(<EnhancedCheckbox label="Option" indeterminate data-testid="checkbox" />);

            let checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.indeterminate).toBe(true);

            rerender(<EnhancedCheckbox label="Option" indeterminate={false} data-testid="checkbox" />);

            checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.indeterminate).toBe(false);
        });

        it("should handle indeterminate state changes dynamically", () => {
            const { rerender } = render(<EnhancedCheckbox label="Option" data-testid="checkbox" />);

            let checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.indeterminate).toBe(false);

            rerender(<EnhancedCheckbox label="Option" indeterminate data-testid="checkbox" />);

            checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.indeterminate).toBe(true);
        });
    });

    describe("Disabled State", () => {
        it("should disable checkbox when disabled prop is true", () => {
            render(<EnhancedCheckbox label="Option" disabled data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.disabled).toBe(true);
        });

        it("should not call onChange when disabled checkbox is clicked", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<EnhancedCheckbox label="Option" disabled onChange={handleChange} data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            await user.click(checkbox);

            expect(handleChange).not.toHaveBeenCalled();
        });

        it("should apply disabled styling", () => {
            render(<EnhancedCheckbox label="Option" disabled data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            expect(checkbox.className).toContain("cursor-not-allowed");
        });
    });

    describe("Ref Forwarding", () => {
        it("should forward ref to checkbox input", () => {
            const TestComponent = () => {
                const ref = useRef<HTMLInputElement>(null);

                return (
                    <>
                        <EnhancedCheckbox ref={ref} label="Option" data-testid="checkbox" />
                        <button onClick={() => ref.current?.focus()} data-testid="focus-btn">
                            Focus
                        </button>
                    </>
                );
            };

            render(<TestComponent />);

            const focusBtn = screen.getByTestId("focus-btn");
            const checkbox = screen.getByTestId("checkbox");

            focusBtn.click();
            expect(checkbox).toHaveFocus();
        });

        it("should allow programmatic indeterminate state via ref", () => {
            const TestComponent = () => {
                const ref = useRef<HTMLInputElement>(null);

                return (
                    <>
                        <EnhancedCheckbox ref={ref} label="Option" data-testid="checkbox" />
                        <button
                            onClick={() => {
                                if (ref.current) {
                                    ref.current.indeterminate = true;
                                }
                            }}
                            data-testid="set-indeterminate"
                        >
                            Set Indeterminate
                        </button>
                    </>
                );
            };

            render(<TestComponent />);

            const setBtn = screen.getByTestId("set-indeterminate");
            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;

            expect(checkbox.indeterminate).toBe(false);

            setBtn.click();
            expect(checkbox.indeterminate).toBe(true);
        });
    });

    describe("Accessibility", () => {
        it("should associate label with checkbox input", () => {
            render(<EnhancedCheckbox label="Accept terms" />);

            const checkbox = screen.getByLabelText("Accept terms");
            expect(checkbox).toHaveAttribute("type", "checkbox");
        });

        it("should be keyboard navigable", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<EnhancedCheckbox label="Option" onChange={handleChange} data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            checkbox.focus();
            expect(checkbox).toHaveFocus();

            await user.click(checkbox);
            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it("should support aria-label when no label is provided", () => {
            render(<EnhancedCheckbox aria-label="Checkbox option" data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            expect(checkbox).toHaveAttribute("aria-label", "Checkbox option");
        });
    });

    describe("Dark Mode Support", () => {
        it("should apply dark mode classes", () => {
            render(<EnhancedCheckbox label="Option" data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox");
            expect(checkbox.className).toContain("dark:");
        });

        it("should apply dark mode error styling", () => {
            render(<EnhancedCheckbox label="Option" error="Error message" />);

            const errorMessage = screen.getByText("Error message");
            expect(errorMessage.className).toContain("dark:");
        });
    });

    describe("Edge Cases", () => {
        it("should handle label with special characters", () => {
            render(<EnhancedCheckbox label="I agree to <Terms> & 'Conditions'" />);

            expect(screen.getByLabelText("I agree to <Terms> & 'Conditions'")).toBeInTheDocument();
        });

        it("should forward other HTML attributes", () => {
            render(<EnhancedCheckbox label="Option" required data-custom="value" data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.required).toBe(true);
            expect(checkbox.dataset.custom).toBe("value");
        });

        it("should handle both checked and indeterminate simultaneously", () => {
            render(<EnhancedCheckbox label="Option" checked indeterminate data-testid="checkbox" />);

            const checkbox = screen.getByTestId("checkbox") as HTMLInputElement;
            expect(checkbox.checked).toBe(true);
            expect(checkbox.indeterminate).toBe(true);
        });
    });
});
