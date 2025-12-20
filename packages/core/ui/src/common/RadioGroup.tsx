import { forwardRef, useId } from "react";
import { cn } from "../lib/utils";
import { FieldWrapper } from "./FieldWrapper";
import { RadioItem } from "./RadioItem";
import type { RadioOptionItem as RadioOption } from "@/types";

export interface RadioGroupProps<T = unknown> {
    label?: string;
    helperText?: string;
    error?: string;
    options: RadioOption<T>[];
    layout?: "horizontal" | "vertical";
    wrapperClassName?: string;
    value?: string;
    onChange?: (value: string) => void;
    disabled?: boolean;
    className?: string;
    id?: string;
    name?: string;
}

export const RadioGroup = forwardRef<HTMLInputElement, RadioGroupProps>(
    (
        {
            label,
            helperText,
            error: errorMessage,
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
            <FieldWrapper
                inputId={generatedId}
                label={label}
                helperText={helperText}
                error={errorMessage}
                wrapperClassName={wrapperClassName}
            >
                <div
                    className={cn(
                        "flex gap-4",
                        layout === "vertical" && "flex-col",
                        layout === "horizontal" && "flex-row flex-wrap"
                    )}
                    role="radiogroup"
                    aria-labelledby={label ? `${groupId}-label` : undefined}
                    aria-describedby={errorMessage ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined}
                >
                    {options.map((opt, index: number) => {
                        const optionId = `${groupId}-option-${index}`;
                        const isChecked = value === opt.value;

                        return (
                            <RadioItem
                                key={opt.value}
                                {...props}
                                ref={index === 0 ? ref : undefined}
                                id={optionId}
                                option={opt}
                                groupName={groupName}
                                isChecked={isChecked}
                                onChange={handleChange}
                                error={errorMessage}
                                disabled={disabled}
                                className={className}
                            />
                        );
                    })}
                </div>
            </FieldWrapper>
        );
    }
);

RadioGroup.displayName = "RadioGroup";
