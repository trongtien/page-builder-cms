import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { Label } from "./Label";
import { FieldWrapper } from "./FieldWrapper";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    label?: string;
    helperText?: string;
    error?: string;
    wrapperClassName?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
    ({ label, helperText, error, className, wrapperClassName, disabled, id, ...props }, ref) => {
        const generatedId = useId();
        const inputId = id || generatedId;

        return (
            <FieldWrapper
                inputId={inputId}
                label={label}
                helperText={helperText}
                error={error}
                wrapperClassName={wrapperClassName}
            >
                <div className="flex items-start">
                    <div className="flex items-center h-5">
                        <input
                            {...props}
                            ref={ref}
                            type="radio"
                            id={inputId}
                            disabled={disabled}
                            className={cn(
                                formClasses.radio,
                                error && "ring-red-500 focus:ring-red-500",
                                disabled && "cursor-not-allowed opacity-60",
                                className
                            )}
                        />
                    </div>
                    {label && (
                        <div className="ml-3">
                            <Label htmlFor={inputId} disabled={disabled} className="text-sm font-normal">
                                {label}
                            </Label>
                        </div>
                    )}
                </div>
            </FieldWrapper>
        );
    }
);

Radio.displayName = "Radio";
