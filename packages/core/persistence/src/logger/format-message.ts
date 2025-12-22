import * as winston from "winston";

export class FormatMessageLogUtils {
    protected static instance: FormatMessageLogUtils;

    private formatDev: winston.Logform.Format;
    private formatProd: winston.Logform.Format;

    constructor() {
        this.formatDev = this.formatMessageDev();
        this.formatProd = this.formatMessageProd();
    }

    public getConfigFormatMessage(): winston.Logform.Format {
        return process.env.NODE_ENV === "production" ? this.formatProd : this.formatDev;
    }

    public static getInstance(): FormatMessageLogUtils {
        if (!FormatMessageLogUtils.instance) {
            FormatMessageLogUtils.instance = new FormatMessageLogUtils();
        }
        return FormatMessageLogUtils.instance;
    }

    private formatMessageDev(): winston.Logform.Format {
        const { combine, timestamp, errors, printf, colorize } = winston.format;
        return combine(
            colorize(),
            timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            errors({ stack: true }),
            printf(({ timestamp, level, message, stack, ...meta }) => {
                let log = `${String(timestamp)} [${String(level)}]: ${String(message)}`;

                if (Object.keys(meta).length > 0) {
                    log += ` ${JSON.stringify(meta)}`;
                }

                if (stack && typeof stack === "string") {
                    log += `\n${stack}`;
                }

                return log;
            })
        );
    }

    private formatMessageProd(): winston.Logform.Format {
        const { combine, timestamp, errors, json } = winston.format;
        return combine(timestamp(), errors({ stack: true }), json());
    }
}
