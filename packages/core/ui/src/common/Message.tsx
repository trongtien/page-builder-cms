import type { HTMLAttributes } from "react";
import { cn } from "../lib/utils";
import { formClasses } from "../lib/formClass";

export type MessageProps = HTMLAttributes<HTMLParagraphElement>;

export const Message = ({ className, ...props }: MessageProps) => {
    return <p className={cn(String(formClasses.error), className)} role="alert" {...props} />;
};

Message.displayName = "Message";
