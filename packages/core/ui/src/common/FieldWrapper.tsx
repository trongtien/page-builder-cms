import type { ReactNode } from "react";
import { cn } from "../lib/utils";
import { Label } from "./Label";
import { Message } from "./Message";
import { HelperText } from "./HelperText";

export interface FieldWrapperProps {
    inputId: string;
    label?: string;
    helperText?: string;
    error?: string;
    wrapperClassName?: string;
    children: ReactNode;
}

export const FieldWrapper = ({ inputId, label, helperText, error, wrapperClassName, children }: FieldWrapperProps) => {
    return (
        <div className={cn("w-full", wrapperClassName)}>
            {label && <Label htmlFor={inputId}>{label}</Label>}
            {children}
            {helperText && !error && <HelperText id={`${inputId}-helper`}>{helperText}</HelperText>}
            {error && <Message id={`${inputId}-error`}>{error}</Message>}
        </div>
    );
};

FieldWrapper.displayName = "FieldWrapper";
