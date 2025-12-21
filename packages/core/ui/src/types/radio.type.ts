import type { InputHTMLAttributes } from "react";
import type { BaseFieldProps } from "./field.type";

export interface RadioOptionItem<Node extends unknown> {
    value: string;
    label: string;
    disabled?: boolean;
    node?: Node;
}

export type RadioLayout = "horizontal" | "vertical";

export type RadioCommon = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">;
export type RadioInternal<T extends unknown> = BaseFieldProps &
    RadioCommon & {
        layout?: RadioLayout;
        option: RadioOptionItem<T>;
        groupName: string;
        isChecked: boolean;
        disabled?: boolean;
        onChange: (value: string) => void;
    };
