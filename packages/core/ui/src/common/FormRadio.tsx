/**
 * FormRadio Component
 * Radio button field integrated with react-hook-form
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Radio } from "./Radio";

export interface FormRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
    name: string;
    label: string;
    helperText?: string;
    wrapperClassName?: string;
}

export const FormRadio = forwardRef<HTMLInputElement, FormRadioProps>(
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
                render={({ field }) => (
                    <Radio
                        {...field}
                        {...props}
                        ref={ref}
                        label={label}
                        helperText={helperText}
                        error={errorMessage}
                        wrapperClassName={wrapperClassName}
                        checked={field.value === props.value}
                    />
                )}
            />
        );
    }
);

FormRadio.displayName = "FormRadio";
