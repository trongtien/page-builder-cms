/**
 * RadioGroup Component
 *
 * A group of radio buttons with flexible layout options.
 * Supports horizontal and vertical layouts for better UX.
 */

import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../../lib/utils";
import { formClasses } from "../../lib/formClass";
import { Label } from "../../common/Label";
import { Message } from "../../common/Message";
import { HelperText } from "../../common/HelperText";

export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface RadioGroupProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> {
    label?: string;
    helperText?: string;
    error?: string;
    options: RadioOption[];
    layout?: "horizontal" | "vertical";
    wrapperClassName?: string;
    value?: string;
    onChange?: (value: string) => void;
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
    (
        {
            label,
            helperText,
            error,
            options,
            layout = "vertical",
            className,
            wrapperClassName,
            disabled,
            id,
            name,
            value,
            onChange,
            ...props
        },
        ref
    ) => {
        const generatedId = useId();
        const groupId = id || generatedId;
        const groupName = name || groupId;

        const handleChange = (optionValue: string) => {
            if (onChange) {
                onChange(optionValue);
            }
        };

        return (
            <div className={cn("w-full", wrapperClassName)}>
                {label && (
                    <Label htmlFor={groupId} disabled={disabled} className="mb-2">
                        {label}
                    </Label>
                )}

                <div
                    className={cn(
                        "flex gap-4",
                        layout === "vertical" && "flex-col",
                        layout === "horizontal" && "flex-row flex-wrap"
                    )}
                    role="radiogroup"
                    aria-labelledby={label ? `${groupId}-label` : undefined}
                    aria-describedby={error ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined}
                >
                    {options.map((option, index) => {
                        const optionId = `${groupId}-option-${index}`;
                        const isChecked = value === option.value;
                        const isDisabled = disabled || option.disabled;

                        return (
                            <div key={option.value} className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        {...props}
                                        ref={index === 0 ? ref : undefined}
                                        type="radio"
                                        id={optionId}
                                        name={groupName}
                                        value={option.value}
                                        checked={isChecked}
                                        disabled={isDisabled}
                                        onChange={() => handleChange(option.value)}
                                        className={cn(
                                            formClasses.radio,
                                            error && "ring-red-500 focus:ring-red-500",
                                            isDisabled && "cursor-not-allowed opacity-60",
                                            className
                                        )}
                                    />
                                </div>
                                <div className="ml-3">
                                    <Label htmlFor={optionId} disabled={isDisabled} className="text-sm font-normal">
                                        {option.label}
                                    </Label>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {helperText && !error && (
                    <HelperText id={`${groupId}-helper`} className="mt-2">
                        {helperText}
                    </HelperText>
                )}

                {error && (
                    <Message id={`${groupId}-error`} className="mt-2">
                        {error}
                    </Message>
                )}
            </div>
        );
    }
);

RadioGroup.displayName = "RadioGroup";
