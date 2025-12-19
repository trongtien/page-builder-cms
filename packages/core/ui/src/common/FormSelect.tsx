/**
 * FormSelect Component
 * Select field integrated with react-hook-form
 */

import { forwardRef, type SelectHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Select, type SelectOption } from "./Select";

export interface FormSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "name"> {
    name: string;
    label?: string;
    helperText?: string;
    options: SelectOption[];
    wrapperClassName?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
    ({ name, label, helperText, options, wrapperClassName, ...props }, ref) => {
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
                    <Select
                        {...field}
                        {...props}
                        ref={ref}
                        label={label}
                        helperText={helperText}
                        error={errorMessage}
                        options={options}
                        wrapperClassName={wrapperClassName}
                    />
                )}
            />
        );
    }
);

FormSelect.displayName = "FormSelect";
