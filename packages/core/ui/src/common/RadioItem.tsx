import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { Label } from "./Label";

export interface RadioOption {
    value: string;
    label: string;
    disabled?: boolean;
}

export interface RadioItemProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
    option: RadioOption;
    groupName: string;
    isChecked: boolean;
    onItemChange: (value: string) => void;
    error?: string;
}

export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(
    ({ option, groupName, isChecked, onItemChange, error, disabled, className, id, ...props }, ref) => {
        const isDisabled = disabled || option.disabled;

        return (
            <div className="flex items-start">
                <div className="flex items-center h-5">
                    <input
                        {...props}
                        ref={ref}
                        type="radio"
                        id={id}
                        name={groupName}
                        value={option.value}
                        checked={isChecked}
                        disabled={isDisabled}
                        onChange={() => onItemChange(option.value)}
                        className={cn(
                            formClasses.radio,
                            error && "ring-red-500 focus:ring-red-500",
                            isDisabled && "cursor-not-allowed opacity-60",
                            className
                        )}
                    />
                </div>
                <div className="ml-3">
                    <Label htmlFor={id} disabled={isDisabled} className="text-sm font-normal">
                        {option.label}
                    </Label>
                </div>
            </div>
        );
    }
);

RadioItem.displayName = "RadioItem";
