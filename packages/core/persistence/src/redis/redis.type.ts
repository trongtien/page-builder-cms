import type { RedisOptions } from "ioredis";

export interface RedisConfig {
    host: string;
    port: number;
    password?: string;
    db: number;
    family: 4 | 6;
    tls?: boolean;
    keyPrefix?: string;
    retryStrategy?: (times: number) => number | void;
    maxRetriesPerRequest?: number;
    enableReadyCheck?: boolean;
    enableOfflineQueue?: boolean;
}

export interface RedisConfigOptions {
    config?: Partial<RedisConfig>;
    debug?: boolean;
}

export interface RedisHealthStatus {
    connected: boolean;
    latency: number;
    lastCheck: Date;
    error?: string;
}

export type IORedisConfig = RedisOptions;
