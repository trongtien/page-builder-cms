export interface BaseFieldProps {
    label?: string;
    helperText?: string;
    error?: string;
    wrapperClassName?: string;
}

export interface BaseFormFieldProps {
    name: string;
    label?: string;
    helperText?: string;
    wrapperClassName?: string;
}

export interface SelectOption {
    value: string;
    label: string;
}
