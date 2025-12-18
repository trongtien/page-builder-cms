import type { ValidationError } from "./node-config.type";

export class ConfigValidationError extends Error {
    constructor(
        message: string,
        public readonly errors: ValidationError[],
        public readonly rawConfig: unknown
    ) {
        // Include formatted errors in the main message
        const formattedMessage = ConfigValidationError.formatErrorMessage(message, errors);
        super(formattedMessage);
        this.name = "ConfigValidationError";
        Error.captureStackTrace(this, this.constructor);
    }

    private static formatErrorMessage(baseMessage: string, errors: ValidationError[]): string {
        if (errors.length === 0) {
            return baseMessage;
        }

        const errorMessages = errors.map((e) => `${e.field}: ${e.message}`);
        return `${baseMessage}\n  - ${errorMessages.join("\n  - ")}`;
    }

    public formatErrors(): string {
        const grouped = this.groupErrors();
        let message = this.message + "\n\n";

        if (grouped.missing.length > 0) {
            message += "Missing required variables:\n";
            message += grouped.missing.map((e) => `  - ${e.field}: ${e.message}`).join("\n");
            message += "\n\n";
        }

        if (grouped.invalid.length > 0) {
            message += "Invalid values:\n";
            message += grouped.invalid.map((e) => `  - ${e.field}: ${e.message}`).join("\n");
            message += "\n\n";
        }

        message += "Please check your .env file or environment variables.";
        return message;
    }

    private groupErrors() {
        const missing: ValidationError[] = [];
        const invalid: ValidationError[] = [];

        for (const error of this.errors) {
            if (error.message.toLowerCase().includes("required")) {
                missing.push(error);
            } else {
                invalid.push(error);
            }
        }

        return { missing, invalid };
    }
}
