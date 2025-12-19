import { forwardRef, useEffect, useId, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { FieldWrapper } from "./FieldWrapper";
import type { BaseFieldProps } from "../types/field.type";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {
    autoResize?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, helperText, error, autoResize, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const generatedId = useId();
        const textareaId = id || generatedId;
        const internalRef = useRef<HTMLTextAreaElement | null>(null);

        // Handle both external ref and internal ref
        const setRefs = (element: HTMLTextAreaElement | null) => {
            internalRef.current = element;
            if (typeof ref === "function") {
                ref(element);
            } else if (ref) {
                ref.current = element;
            }
        };

        // Auto-resize functionality
        useEffect(() => {
            if (autoResize && internalRef.current) {
                const textarea = internalRef.current;
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        }, [props.value, autoResize]);

        return (
            <FieldWrapper
                inputId={textareaId}
                label={label}
                helperText={helperText}
                error={error}
                wrapperClassName={wrapperClassName}
            >
                <textarea
                    {...props}
                    id={textareaId}
                    ref={setRefs}
                    disabled={disabled}
                    className={cn(
                        String(formClasses.textarea),
                        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
                        autoResize && "resize-none overflow-hidden",
                        className
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-describedby={error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined}
                />
            </FieldWrapper>
        );
    }
);

Textarea.displayName = "Textarea";
