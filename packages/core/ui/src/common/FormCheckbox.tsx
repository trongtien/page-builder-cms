/**
 * FormCheckbox Component
 * Checkbox field integrated with react-hook-form
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Checkbox } from "./Checkbox";
import type { BaseFormFieldProps } from "../types/field.type";

export interface FormCheckboxProps
    extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type">,
        Omit<BaseFormFieldProps, "label"> {
    name: string;
    label: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
    ({ name, label, helperText, wrapperClassName, ...props }, ref) => {
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
                render={({ field: { value, onChange, ...field } }) => (
                    <Checkbox
                        {...field}
                        {...props}
                        ref={ref}
                        label={label}
                        helperText={helperText}
                        error={errorMessage}
                        wrapperClassName={wrapperClassName}
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                )}
            />
        );
    }
);

FormCheckbox.displayName = "FormCheckbox";
