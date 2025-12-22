import type { Knex } from "knex";

export interface DatabaseConfig {
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
    ssl?: boolean | { rejectUnauthorized: boolean };
    pool?: {
        min: number;
        max: number;
        idleTimeoutMillis?: number;
        acquireTimeoutMillis?: number;
    };
}

export interface KnexConfigOptions {
    database?: string;
    config?: Partial<DatabaseConfig>;
    debug?: boolean;
    migrationsDir?: string;
    seedsDir?: string;
}

export interface KnexFileConfigOptions {
    migrationsDir?: string;
    seedsDir?: string;
    migrationsTableName?: string;
    developmentPool?: { min?: number; max?: number };
    stagingPool?: { min?: number; max?: number };
    productionPool?: { min?: number; max?: number };
    baseConfigOverrides?: Partial<Knex.Config>;
}

export interface HealthCheckResult {
    status: "healthy" | "unhealthy";
    latency: number;
    timestamp: Date;
    error?: string;
    details?: {
        connected: boolean;
        poolSize?: number;
    };
}

export type TransactionCallback<T> = (trx: Knex.Transaction) => Promise<T>;

export interface PaginationOptions {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface PaginationResult<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

export interface QueryOptions {
    fields?: string[];
    orderBy?: { column: string; order?: "asc" | "desc" }[];
    limit?: number;
    offset?: number;
    withDeleted?: boolean;
}

export type WhereCondition = Record<string, unknown>;
export type InsertData<T> = Partial<T> | Partial<T>[];
export type UpdateData<T> = Partial<T>;
export interface BaseModel {
    id: number;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date | null;
}
