import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";

export type HelperTextProps = HTMLAttributes<HTMLParagraphElement>;

export const HelperText = ({ className, ...props }: HelperTextProps) => {
    return <p className={cn(String(formClasses.helperText), className)} {...props} />;
};

HelperText.displayName = "HelperText";
