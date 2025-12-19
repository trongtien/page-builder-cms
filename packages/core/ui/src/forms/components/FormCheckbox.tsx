/**
 * FormCheckbox Component
 * Checkbox field integrated with react-hook-form
 */

import { forwardRef, type InputHTMLAttributes } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { formClasses } from "../config";
import { cn } from "../../lib/utils";

export interface FormCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "name" | "type"> {
    name: string;
    label: string;
    helperText?: string;
    wrapperClassName?: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
    ({ name, label, helperText, className, wrapperClassName, disabled, ...props }, ref) => {
        const {
            control,
            formState: { errors }
        } = useFormContext();

        const error = errors[name];
        const errorMessage = error?.message as string | undefined;

        return (
            <div className={cn("w-full", wrapperClassName)}>
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <Controller
                            name={name}
                            control={control}
                            render={({ field: { value, onChange, ...field } }) => (
                                <input
                                    {...field}
                                    {...props}
                                    type="checkbox"
                                    id={name}
                                    ref={ref}
                                    checked={!!value}
                                    onChange={(e) => onChange(e.target.checked)}
                                    disabled={disabled}
                                    className={cn(
                                        formClasses.checkbox,
                                        error && "ring-red-500 focus:ring-red-500",
                                        disabled && "cursor-not-allowed opacity-60",
                                        className
                                    )}
                                    aria-invalid={error ? "true" : "false"}
                                    aria-describedby={
                                        error ? `${name}-error` : helperText ? `${name}-helper` : undefined
                                    }
                                />
                            )}
                        />
                    </div>
                    <div className="ml-3">
                        <label
                            htmlFor={name}
                            className={cn(
                                "text-sm font-medium text-gray-900 dark:text-gray-200",
                                disabled && "cursor-not-allowed opacity-60"
                            )}
                        >
                            {label}
                        </label>
                        {helperText && !errorMessage && (
                            <p id={`${name}-helper`} className={cn(formClasses.helperText, "mt-0")}>
                                {helperText}
                            </p>
                        )}
                    </div>
                </div>

                {errorMessage && (
                    <p id={`${name}-error`} className={formClasses.error} role="alert">
                        {errorMessage}
                    </p>
                )}
            </div>
        );
    }
);

FormCheckbox.displayName = "FormCheckbox";
