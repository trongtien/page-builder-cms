import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "danger" | "ghost";
    size?: "small" | "medium" | "large";
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "medium",
    fullWidth = false,
    loading = false,
    children,
    className = "",
    disabled,
    ...props
}) => {
    const baseClass = "btn";
    const variantClass = `btn-${variant}`;
    const sizeClass = `btn-${size}`;
    const widthClass = fullWidth ? "btn-full" : "";
    const loadingClass = loading ? "btn-loading" : "";

    const classes = [baseClass, variantClass, sizeClass, widthClass, loadingClass, className].filter(Boolean).join(" ");

    return (
        <button className={classes} disabled={disabled || loading} {...props}>
            {loading && <span className="btn-spinner" />}
            {children}
        </button>
    );
};
