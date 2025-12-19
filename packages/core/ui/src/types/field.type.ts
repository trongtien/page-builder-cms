/**
 * Common field types for form components
 */

/**
 * Base props shared by all field components
 */
export interface BaseFieldProps {
    label?: string;
    helperText?: string;
    error?: string;
    wrapperClassName?: string;
}

/**
 * Base props for form-integrated field components (without error prop)
 */
export interface BaseFormFieldProps {
    name: string;
    label?: string;
    helperText?: string;
    wrapperClassName?: string;
}

/**
 * Select option type
 */
export interface SelectOption {
    value: string;
    label: string;
}
