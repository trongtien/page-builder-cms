import { forwardRef, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { Label } from "./Label";
import { Message } from "./Message";
import { HelperText } from "./HelperText";

export interface SelectOption {
    value: string;
    label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    helperText?: string;
    error?: string;
    options: SelectOption[];
    wrapperClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, helperText, error, options, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const selectId = id || props.name || `select-${Math.random().toString(36).slice(2, 9)}`;

        return (
            <div className={cn("w-full", wrapperClassName)}>
                {label && <Label htmlFor={selectId}>{label}</Label>}
                <select
                    {...props}
                    id={selectId}
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        String(formClasses.select),
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {helperText && !error && <HelperText id={`${selectId}-helper`}>{helperText}</HelperText>}
                {error && <Message id={`${selectId}-error`}>{error}</Message>}
            </div>
        );
    }
);

Select.displayName = "Select";
