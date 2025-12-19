/**
 * FormTextarea Component
 * Textarea field integrated with react-hook-form
 */

import { forwardRef, type TextareaHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Textarea } from "./Textarea";

export interface FormTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "name"> {
    name: string;
    label?: string;
    helperText?: string;
    autoResize?: boolean;
    wrapperClassName?: string;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ name, label, helperText, autoResize, wrapperClassName, ...props }, ref) => {
        const {
            control,
            formState: { errors }
        } = useFormContext();

        const error = errors[name];
        const errorMessage = error?.message as string | undefined;

        return (
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    <Textarea
                        {...field}
                        {...props}
                        ref={ref}
                        label={label}
                        helperText={helperText}
                        error={errorMessage}
                        autoResize={autoResize}
                        wrapperClassName={wrapperClassName}
                    />
                )}
            />
        );
    }
);

FormTextarea.displayName = "FormTextarea";
