import { forwardRef } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";
import { Label } from "./Label";
import type { RadioInternal } from "@/types";

export type RadioItemProps<T = unknown> = Omit<RadioInternal<T>, "layout">;

export const RadioItem = forwardRef<HTMLInputElement, RadioItemProps>(
    ({ option, groupName, isChecked, onChange, error, disabled, className, id, ...props }, ref) => {
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
                        onChange={() => onChange(option.value)}
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
