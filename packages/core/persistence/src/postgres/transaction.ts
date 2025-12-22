import type { PrismaClient } from "../generated/client";
import { prisma } from "./client";
import { persistenceLogger } from "../logger";

export type TransactionCallback<T> = (tx: PrismaClient) => Promise<T>;

export async function withTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
    try {
        return await prisma.$transaction(async (tx) => {
            return callback(tx as PrismaClient);
        });
    } catch (error) {
        persistenceLogger.transaction("rollback", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined
        });

        throw error;
    }
}

export async function withTransactionTimeout<T>(callback: TransactionCallback<T>, timeout: number): Promise<T> {
    try {
        return await prisma.$transaction(
            async (tx) => {
                return callback(tx as PrismaClient);
            },
            {
                timeout
            }
        );
    } catch (error) {
        persistenceLogger.transaction("rollback", {
            error: error instanceof Error ? error.message : "Unknown error",
            stack: error instanceof Error ? error.stack : undefined,
            timeout
        });

        throw error;
    }
}
