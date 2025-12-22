import type { LoggerOptions } from "winston";
import * as winston from "winston";
import type { LoggerConfigOptions } from "./logger.type";
import { FormatMessageLogUtils } from "./format-message";

export class LoggerConfigBuilder {
    private static instance: LoggerConfigBuilder;
    private formatUtils: FormatMessageLogUtils;

    private serviceName: string;
    private defaultMeta: Record<string, unknown>;
    private level: string;
    private _enableFileLogging: boolean;
    private logDir: string;

    constructor(options: LoggerConfigOptions = {}) {
        this.formatUtils = FormatMessageLogUtils.getInstance();
        this.serviceName = options.serviceName || "@page-builder/persistence";
        this.defaultMeta = options.defaultMeta || {};
        this.level = options.level || this.getLogLevel();
        this._enableFileLogging = options.enableFileLogging ?? process.env.LOG_TO_FILE === "true";
        this.logDir = options.logDir || process.env.LOG_DIR || "./logs";
    }

    public static getInstance(): LoggerConfigBuilder {
        if (!LoggerConfigBuilder.instance) {
            LoggerConfigBuilder.instance = new LoggerConfigBuilder();
        }
        return LoggerConfigBuilder.instance;
    }

    private getLogLevel(): string {
        if (process.env.LOG_LEVEL) {
            return process.env.LOG_LEVEL;
        }
        return process.env.NODE_ENV === "production" ? "info" : "debug";
    }

    public setServiceName(serviceName: string): this {
        this.serviceName = serviceName;
        return this;
    }

    public setLevel(level: string): this {
        this.level = level;
        return this;
    }

    public addDefaultMeta(meta: Record<string, unknown>): this {
        this.defaultMeta = { ...this.defaultMeta, ...meta };
        return this;
    }

    public setDefaultMeta(meta: Record<string, unknown>): this {
        this.defaultMeta = meta;
        return this;
    }

    public enableFileLogging(enable = true): this {
        this._enableFileLogging = enable;
        return this;
    }

    public setLogDir(dir: string): this {
        this.logDir = dir;
        return this;
    }

    private buildTransports(): winston.transport[] {
        const transports: winston.transport[] = [
            // Console transport for all environments
            new winston.transports.Console({
                handleExceptions: true,
                handleRejections: true
            })
        ];

        // Add file transports for production if enabled
        if (process.env.NODE_ENV === "production" && this._enableFileLogging) {
            transports.push(
                new winston.transports.File({
                    filename: `${this.logDir}/error.log`,
                    level: "error",
                    maxsize: 5242880,
                    maxFiles: 5
                }),
                new winston.transports.File({
                    filename: `${this.logDir}/combined.log`,
                    maxsize: 5242880,
                    maxFiles: 5
                })
            );
        }

        return transports;
    }

    public build(): LoggerOptions {
        return {
            level: this.level,
            format: this.formatUtils.getConfigFormatMessage(),
            defaultMeta: {
                service: this.serviceName,
                environment: process.env.NODE_ENV || "development",
                ...this.defaultMeta
            },
            transports: this.buildTransports(),
            exitOnError: false
        };
    }

    public static getLogLevel(): string {
        if (process.env.LOG_LEVEL) {
            return process.env.LOG_LEVEL;
        }
        return process.env.NODE_ENV === "production" ? "info" : "debug";
    }
}

export function createLoggerConfig(options: LoggerConfigOptions = {}): LoggerOptions {
    return new LoggerConfigBuilder(options).build();
}
export const getLogLevel = () => LoggerConfigBuilder.getLogLevel();
export const loggerConfig: LoggerOptions = new LoggerConfigBuilder().build();
