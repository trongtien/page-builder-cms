/**
 * FormInput Component
 * Input field integrated with react-hook-form
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "./Input";
import type { BaseFormFieldProps } from "../types/field.type";

export interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name">, BaseFormFieldProps {}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ name, label, helperText, wrapperClassName, ...props }, ref) => {
        const { control } = useFormContext();

        return (
            <Controller
                name={name}
                control={control}
                render={({ field, fieldState }) => (
                    <Input
                        {...field}
                        {...props}
                        ref={ref}
                        label={label}
                        helperText={helperText}
                        error={fieldState.error?.message}
                        wrapperClassName={wrapperClassName}
                    />
                )}
            />
        );
    }
);

FormInput.displayName = "FormInput";
