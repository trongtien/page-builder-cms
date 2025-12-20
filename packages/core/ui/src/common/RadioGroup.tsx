import { forwardRef, useId, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { FieldWrapper } from "./FieldWrapper";
import { RadioItem, type RadioOption } from "./RadioItem";

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
            <FieldWrapper
                inputId={generatedId}
                label={label}
                helperText={helperText}
                error={error}
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
                    aria-describedby={error ? `${groupId}-error` : helperText ? `${groupId}-helper` : undefined}
                >
                    {options.map((option, index) => {
                        const optionId = `${groupId}-option-${index}`;
                        const isChecked = value === option.value;

                        return (
                            <RadioItem
                                key={option.value}
                                {...props}
                                ref={index === 0 ? ref : undefined}
                                id={optionId}
                                option={option}
                                groupName={groupName}
                                isChecked={isChecked}
                                onItemChange={handleChange}
                                error={error}
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
