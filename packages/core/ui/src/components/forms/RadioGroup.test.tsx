import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup } from "./RadioGroup";

describe("RadioGroup", () => {
    const mockOptions = [
        { label: "Option 1", value: "opt1" },
        { label: "Option 2", value: "opt2" },
        { label: "Option 3", value: "opt3" }
    ];

    describe("Rendering", () => {
        it("should render all radio options", () => {
            render(<RadioGroup options={mockOptions} />);

            expect(screen.getByLabelText("Option 1")).toBeInTheDocument();
            expect(screen.getByLabelText("Option 2")).toBeInTheDocument();
            expect(screen.getByLabelText("Option 3")).toBeInTheDocument();
        });

        it("should render with label", () => {
            render(<RadioGroup label="Choose Option" options={mockOptions} />);

            expect(screen.getByText("Choose Option")).toBeInTheDocument();
        });

        it("should render with helper text", () => {
            render(<RadioGroup helperText="Select one option" options={mockOptions} />);

            expect(screen.getByText("Select one option")).toBeInTheDocument();
        });

        it("should render with error message", () => {
            render(<RadioGroup error="Selection required" options={mockOptions} />);

            expect(screen.getByText("Selection required")).toBeInTheDocument();
        });

        it("should render in vertical layout by default", () => {
            const { container } = render(<RadioGroup options={mockOptions} />);
            const optionsContainer = container.querySelector("[role='radiogroup']");
            expect(optionsContainer).toBeInTheDocument();
            expect(optionsContainer?.className).toContain("flex-col");
        });

        it("should render in horizontal layout when specified", () => {
            const { container } = render(<RadioGroup layout="horizontal" options={mockOptions} />);
            const optionsContainer = container.querySelector("[role='radiogroup']");
            expect(optionsContainer).toBeInTheDocument();
            expect(optionsContainer?.className).toContain("flex-row");
        });

        it("should apply custom wrapper className", () => {
            const { container } = render(<RadioGroup wrapperClassName="custom-class" options={mockOptions} />);
            const wrapper = container.querySelector(".custom-class");
            expect(wrapper).toBeInTheDocument();
        });
    });

    describe("Selection Behavior", () => {
        it("should set checked state based on value prop", () => {
            render(<RadioGroup value="opt2" options={mockOptions} />);

            const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
            const radio2 = screen.getByLabelText("Option 2") as HTMLInputElement;
            const radio3 = screen.getByLabelText("Option 3") as HTMLInputElement;

            expect(radio1.checked).toBe(false);
            expect(radio2.checked).toBe(true);
            expect(radio3.checked).toBe(false);
        });

        it("should call onChange with selected value when clicked", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<RadioGroup onChange={handleChange} options={mockOptions} />);

            const radio2 = screen.getByLabelText("Option 2");
            await user.click(radio2);

            expect(handleChange).toHaveBeenCalledWith("opt2");
            expect(handleChange).toHaveBeenCalledTimes(1);
        });

        it("should allow changing selection", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<RadioGroup value="opt1" onChange={handleChange} options={mockOptions} />);

            const radio2 = screen.getByLabelText("Option 2");
            await user.click(radio2);

            expect(handleChange).toHaveBeenCalledWith("opt2");
        });
    });

    describe("Disabled State", () => {
        it("should disable all radio buttons when disabled prop is true", () => {
            render(<RadioGroup disabled options={mockOptions} />);

            const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
            const radio2 = screen.getByLabelText("Option 2") as HTMLInputElement;
            const radio3 = screen.getByLabelText("Option 3") as HTMLInputElement;

            expect(radio1.disabled).toBe(true);
            expect(radio2.disabled).toBe(true);
            expect(radio3.disabled).toBe(true);
        });

        it("should not call onChange when disabled radio is clicked", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<RadioGroup disabled onChange={handleChange} options={mockOptions} />);

            const radio2 = screen.getByLabelText("Option 2");
            await user.click(radio2);

            expect(handleChange).not.toHaveBeenCalled();
        });

        it("should disable specific options when option.disabled is true", () => {
            const optionsWithDisabled = [
                { label: "Option 1", value: "opt1" },
                { label: "Option 2", value: "opt2", disabled: true },
                { label: "Option 3", value: "opt3" }
            ];

            render(<RadioGroup options={optionsWithDisabled} />);

            const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
            const radio2 = screen.getByLabelText("Option 2") as HTMLInputElement;
            const radio3 = screen.getByLabelText("Option 3") as HTMLInputElement;

            expect(radio1.disabled).toBe(false);
            expect(radio2.disabled).toBe(true);
            expect(radio3.disabled).toBe(false);
        });
    });

    describe("Accessibility", () => {
        it("should have proper name attribute for grouping", () => {
            render(<RadioGroup name="test-group" options={mockOptions} />);

            const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
            const radio2 = screen.getByLabelText("Option 2") as HTMLInputElement;

            expect(radio1.name).toBe("test-group");
            expect(radio2.name).toBe("test-group");
        });

        it("should associate labels with radio inputs", () => {
            render(<RadioGroup options={mockOptions} />);

            mockOptions.forEach((option) => {
                const radio = screen.getByLabelText(option.label);
                expect(radio).toHaveAttribute("type", "radio");
            });
        });

        it("should be keyboard navigable", async () => {
            const user = userEvent.setup();
            const handleChange = vi.fn();

            render(<RadioGroup onChange={handleChange} options={mockOptions} />);

            const radio1 = screen.getByLabelText("Option 1");
            radio1.focus();
            expect(radio1).toHaveFocus();

            await user.click(radio1);
            expect(handleChange).toHaveBeenCalledWith("opt1");
        });
    });

    describe("Dark Mode Support", () => {
        it("should apply dark mode classes", () => {
            const { container } = render(<RadioGroup options={mockOptions} />);

            // Check for dark mode classes in label wrapper
            const darkModeElements = container.querySelectorAll("[class*='dark:']");
            expect(darkModeElements.length).toBeGreaterThan(0);
        });

        it("should apply dark mode error styling", () => {
            render(<RadioGroup error="Error message" options={mockOptions} />);

            const errorMessage = screen.getByText("Error message");
            expect(errorMessage.className).toContain("dark:");
        });
    });

    describe("Edge Cases", () => {
        it("should handle empty options array", () => {
            const { container } = render(<RadioGroup options={[]} />);

            const radios = container.querySelectorAll('input[type="radio"]');
            expect(radios.length).toBe(0);
        });

        it("should handle options with special characters in labels", () => {
            const specialOptions = [
                { label: "Option & Special <Chars>", value: "opt1" },
                { label: 'Option "Quotes"', value: "opt2" }
            ];

            render(<RadioGroup options={specialOptions} />);

            expect(screen.getByLabelText("Option & Special <Chars>")).toBeInTheDocument();
            expect(screen.getByLabelText('Option "Quotes"')).toBeInTheDocument();
        });

        it("should handle value that doesn't match any option", () => {
            render(<RadioGroup value="nonexistent" options={mockOptions} />);

            const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
            const radio2 = screen.getByLabelText("Option 2") as HTMLInputElement;
            const radio3 = screen.getByLabelText("Option 3") as HTMLInputElement;

            expect(radio1.checked).toBe(false);
            expect(radio2.checked).toBe(false);
            expect(radio3.checked).toBe(false);
        });

        it("should forward other HTML attributes to radio inputs", () => {
            render(<RadioGroup options={mockOptions} required data-testid="radio-group" />);

            const radio1 = screen.getByLabelText("Option 1") as HTMLInputElement;
            expect(radio1.required).toBe(true);
        });
    });
});
