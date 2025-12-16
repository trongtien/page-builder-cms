import React from "react";

export interface CardProps {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    title,
    subtitle,
    children,
    className = "",
    hoverable = false,
    onClick
}) => {
    const classes = ["card", hoverable && "card-hoverable", className].filter(Boolean).join(" ");

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (onClick && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            onClick();
        }
    };

    return (
        <div
            className={classes}
            onClick={onClick}
            onKeyDown={onClick ? handleKeyDown : undefined}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {(title || subtitle) && (
                <div className="card-header">
                    {title && <h3 className="card-title">{title}</h3>}
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            )}
            <div className="card-content">{children}</div>
        </div>
    );
};
