import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { Label } from "./Label";
import { Message } from "./Message";
import { HelperText } from "./HelperText";
import type { BaseFieldProps } from "../types/field.type";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type">, Omit<BaseFieldProps, "label"> {
    label: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ label, helperText, error, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <div className={cn("w-full", wrapperClassName)}>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            {...props}
                            type="radio"
                            id={inputId}
                            ref={ref}
                            disabled={disabled}
                            className={cn(
                                String(formClasses.radio),
                                error && "ring-red-500 focus:ring-red-500",
                                disabled && "cursor-not-allowed opacity-60",
                                className
                            )}
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
                        />
                    </div>
                    <div className="ml-3">
                        <Label htmlFor={inputId} disabled={disabled}>
                            {label}
                        </Label>
                        {helperText && !error && (
                            <HelperText id={`${inputId}-helper`} className="mt-0">
                                {helperText}
                            </HelperText>
                        )}
                    </div>
                </div>

                {error && <Message id={`${inputId}-error`}>{error}</Message>}
            </div>
        );
    }
);

Radio.displayName = "Radio";
