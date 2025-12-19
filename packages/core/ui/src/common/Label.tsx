import type { LabelHTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
    disabled?: boolean;
}

export const Label = ({ className, disabled, ...props }: LabelProps) => {
    return (
        // eslint-disable-next-line jsx-a11y/label-has-associated-control
        <label
            className={cn(String(formClasses.label), disabled && "cursor-not-allowed opacity-60", className)}
            {...props}
        />
    );
};

Label.displayName = "Label";
