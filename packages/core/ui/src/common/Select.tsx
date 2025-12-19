import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps, SelectOption } from "../types/field.type";

export type { SelectOption };

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseFieldProps {
    options: SelectOption[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, helperText, error, options, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const generatedId = useId();
        const selectId = id || generatedId;

        return (
            <FieldWrapper
                inputId={selectId}
                label={label}
                helperText={helperText}
                error={error}
                wrapperClassName={wrapperClassName}
            >
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
            </FieldWrapper>
        );
    }
);

Select.displayName = "Select";
