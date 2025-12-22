export interface LoggerConfigOptions {
    serviceName?: string;
    defaultMeta?: Record<string, unknown>;
    level?: string;
    enableFileLogging?: boolean;
    logDir?: string;
}
