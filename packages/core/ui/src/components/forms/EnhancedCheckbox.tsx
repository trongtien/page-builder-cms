/**
 * EnhancedCheckbox Component
 *
 * Enhanced checkbox with indeterminate state support.
 * Useful for "select all" functionality or partial selections.
 */

import { forwardRef, useEffect, useRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { formClasses } from "../../lib/formClass";
import { Label } from "../../common/Label";
import { Message } from "../../common/Message";
import { HelperText } from "../../common/HelperText";

export interface EnhancedCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label: string;
    helperText?: string;
    error?: string;
    wrapperClassName?: string;
    indeterminate?: boolean;
}

export const EnhancedCheckbox = forwardRef<HTMLInputElement, EnhancedCheckboxProps>(
    ({ label, helperText, error, className, wrapperClassName, disabled, id, indeterminate = false, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;
        const internalRef = useRef<HTMLInputElement | null>(null);

        // Handle both external ref and internal ref
        const setRefs = (element: HTMLInputElement | null) => {
            internalRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        };

        // Set indeterminate state (not controllable via props in HTML)
        useEffect(() => {
            if (internalRef.current) {
                internalRef.current.indeterminate = indeterminate;
            }
        }, [indeterminate]);

        return (
            <div className={cn("w-full", wrapperClassName)}>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            {...props}
                            type="checkbox"
                            id={inputId}
                            ref={setRefs}
                            disabled={disabled}
                            className={cn(
                                formClasses.checkbox,
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

EnhancedCheckbox.displayName = "EnhancedCheckbox";
