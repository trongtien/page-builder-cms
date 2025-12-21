/**
 * Logger Configuration
 *
 * Defines Winston logger configuration with environment-based settings
 * Provides structured logging with appropriate formats for development and production
 */

import type { LoggerOptions } from "winston";
import * as winston from "winston";

const { combine, timestamp, errors, json, printf, colorize } = winston.format;

/**
 * Custom format for development logs
 * Provides human-readable colored output with timestamps
 */
const devFormat = combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    printf(({ timestamp, level, message, stack, ...meta }) => {
        let log = `${String(timestamp)} [${String(level)}]: ${String(message)}`;

        // Add metadata if present
        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }

        // Add stack trace for errors
        if (stack && typeof stack === "string") {
            log += `\n${stack}`;
        }

        return log;
    })
);

/**
 * Production format
 * JSON structured logging for log aggregation and analysis
 */
const prodFormat = combine(timestamp(), errors({ stack: true }), json());

/**
 * Log levels based on environment
 */
export const getLogLevel = (): string => {
    if (process.env.LOG_LEVEL) {
        return process.env.LOG_LEVEL;
    }

    return process.env.NODE_ENV === "production" ? "info" : "debug";
};

/**
 * Winston logger configuration
 * Automatically adjusts format and transports based on environment
 */
export const loggerConfig: LoggerOptions = {
    level: getLogLevel(),
    format: process.env.NODE_ENV === "production" ? prodFormat : devFormat,
    defaultMeta: {
        service: "@page-builder/persistence",
        environment: process.env.NODE_ENV || "development"
    },
    transports: [
        // Console transport for all environments
        new winston.transports.Console({
            handleExceptions: true,
            handleRejections: true
        })
    ],
    // Exit on unhandled exceptions and rejections
    exitOnError: false
};

/**
 * Add file transports for production
 * Logs errors to separate file for easier troubleshooting
 */
if (process.env.NODE_ENV === "production" && process.env.LOG_TO_FILE === "true") {
    const logDir = process.env.LOG_DIR || "./logs";

    // Ensure transports is an array before pushing
    if (Array.isArray(loggerConfig.transports)) {
        loggerConfig.transports.push(
            // Error logs
            new winston.transports.File({
                filename: `${logDir}/error.log`,
                level: "error",
                maxsize: 5242880, // 5MB
                maxFiles: 5
            }),
            // Combined logs
            new winston.transports.File({
                filename: `${logDir}/combined.log`,
                maxsize: 5242880, // 5MB
                maxFiles: 5
            })
        );
    }
}
