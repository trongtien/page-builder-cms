import { forwardRef, useEffect, useRef, type TextareaHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { Label } from "./Label";
import { Message } from "./Message";
import { HelperText } from "./HelperText";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    helperText?: string;
    error?: string;
    autoResize?: boolean;
    wrapperClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, helperText, error, autoResize, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const textareaId = id || props.name || `textarea-${Math.random().toString(36).slice(2, 9)}`;
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
            <div className={cn("w-full", wrapperClassName)}>
                {label && <Label htmlFor={textareaId}>{label}</Label>}
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
                {helperText && !error && <HelperText id={`${textareaId}-helper`}>{helperText}</HelperText>}
                {error && <Message id={`${textareaId}-error`}>{error}</Message>}
            </div>
        );
    }
);

Textarea.displayName = "Textarea";
