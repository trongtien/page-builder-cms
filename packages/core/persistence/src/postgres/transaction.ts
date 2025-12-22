import type { Knex } from "knex";
import { DatabaseClient } from "./client";
import { persistenceLogger } from "../logger";
import type { TransactionCallback } from "./postgres.type";

/**
 * Transaction Manager Class
 * Provides OOP interface for database transactions
 */
export class TransactionManager {
    private static instance: TransactionManager;
    private dbClient: DatabaseClient;

    private constructor(dbClient?: DatabaseClient) {
        this.dbClient = dbClient || DatabaseClient.getInstance();
    }

    /**
     * Get singleton instance
     */
    public static getInstance(dbClient?: DatabaseClient): TransactionManager {
        if (!TransactionManager.instance) {
            TransactionManager.instance = new TransactionManager(dbClient);
        }
        return TransactionManager.instance;
    }

    /**
     * Execute callback within a transaction
     * Automatically commits on success, rolls back on error
     */
    public async execute<T>(callback: TransactionCallback<T>): Promise<T> {
        const knex = await this.dbClient.getKnex();

        try {
            persistenceLogger.transaction("start", { message: "Transaction started" });

            const result = await knex.transaction(async (trx) => {
                return callback(trx);
            });

            persistenceLogger.transaction("commit", { message: "Transaction committed" });
            return result;
        } catch (error) {
            persistenceLogger.transaction("rollback", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        }
    }

    /**
     * Execute transaction with timeout
     */
    public async executeWithTimeout<T>(callback: TransactionCallback<T>, timeoutMs: number): Promise<T> {
        const knex = await this.dbClient.getKnex();

        try {
            persistenceLogger.transaction("start", {
                message: "Transaction started with timeout",
                timeout: timeoutMs
            });

            const result = await Promise.race([
                knex.transaction(async (trx) => {
                    return callback(trx);
                }),
                new Promise<never>((_, reject) => {
                    setTimeout(() => reject(new Error(`Transaction timeout after ${timeoutMs}ms`)), timeoutMs);
                })
            ]);

            persistenceLogger.transaction("commit", {
                message: "Transaction committed",
                timeout: timeoutMs
            });
            return result;
        } catch (error) {
            persistenceLogger.transaction("rollback", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
                timeout: timeoutMs
            });
            throw error;
        }
    }

    /**
     * Execute multiple transactions in sequence
     */
    public async executeSequence<T>(callbacks: TransactionCallback<T>[]): Promise<T[]> {
        const results: T[] = [];

        for (const callback of callbacks) {
            const result = await this.execute(callback);
            results.push(result);
        }

        return results;
    }

    /**
     * Create a new transaction and return it
     * Useful for manual transaction management
     */
    public async createTransaction(): Promise<Knex.Transaction> {
        const knex = await this.dbClient.getKnex();
        const trx = await knex.transaction();

        persistenceLogger.transaction("start", {
            message: "Manual transaction created",
            manual: true
        });

        return trx;
    }
}

/**
 * Execute callback within a transaction (functional approach)
 */
export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
    return TransactionManager.getInstance().execute(callback);
}

/**
 * Execute transaction with timeout (functional approach)
 */
export async function withTransactionTimeout<T>(callback: TransactionCallback<T>, timeout: number): Promise<T> {
    return TransactionManager.getInstance().executeWithTimeout(callback, timeout);
}

/**
 * Default transaction manager instance
 */
export const transactionManager = TransactionManager.getInstance();
