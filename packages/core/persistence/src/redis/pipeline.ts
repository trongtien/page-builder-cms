import type { ChainableCommander } from "ioredis";
import type { RedisClient } from "./client";
import { persistenceLogger } from "../logger";

export async function executePipeline(
    client: RedisClient,
    commands: (pipeline: ChainableCommander) => void
): Promise<[Error | null, unknown][]> {
    try {
        const pipeline = client.pipeline();
        commands(pipeline);

        const results = await pipeline.exec();

        persistenceLogger.info("redis-pipeline-executed", {
            commandCount: results?.length || 0,
            message: "Redis pipeline executed successfully"
        });

        return results || [];
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        persistenceLogger.error("redis-pipeline-failed", {
            error: errorMessage
        });
        throw new Error(`Pipeline execution failed: ${errorMessage}`);
    }
}

export async function executeTransaction(
    client: RedisClient,
    commands: (pipeline: ChainableCommander) => void
): Promise<[Error | null, unknown][]> {
    try {
        const redisInstance = client.getClient();
        const pipeline = redisInstance.multi();
        commands(pipeline);

        // Execute transaction
        const results = await pipeline.exec();

        persistenceLogger.info("redis-transaction-executed", {
            commandCount: results?.length || 0,
            message: "Redis transaction executed successfully"
        });

        return results || [];
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        persistenceLogger.error("redis-transaction-failed", {
            error: errorMessage
        });
        throw new Error(`Transaction execution failed: ${errorMessage}`);
    }
}
