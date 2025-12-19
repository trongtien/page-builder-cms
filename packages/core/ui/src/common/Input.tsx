import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { FieldWrapper } from "./FieldWrapper";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    wrapperClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, helperText, error, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <FieldWrapper
                inputId={inputId}
                label={label}
                helperText={helperText}
                error={error}
                wrapperClassName={wrapperClassName}
            >
                <input
                    {...props}
                    id={inputId}
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        String(formClasses.input),
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                />
            </FieldWrapper>
        );
    }
);

Input.displayName = "Input";
