import type { RedisHealthStatus } from "./redis.type";
import type { RedisClient } from "./client";
import { persistenceLogger } from "../logger";

export async function checkRedisHealth(client: RedisClient): Promise<RedisHealthStatus> {
    const startTime = Date.now();
    const lastCheck = new Date();

    try {
        // Check if connected
        if (!client.isRedisConnected()) {
            return {
                connected: false,
                latency: 0,
                lastCheck,
                error: "Redis client not connected"
            };
        }

        // Perform PING to measure latency
        const redisInstance = client.getClient();
        await redisInstance.ping();

        const latency = Date.now() - startTime;

        persistenceLogger.connection("connect", {
            connected: true,
            latency,
            message: "Redis health check passed"
        });

        return {
            connected: true,
            latency,
            lastCheck
        };
    } catch (error) {
        const latency = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : "Unknown error";

        persistenceLogger.error("redis-health-check-failed", {
            error: errorMessage,
            latency
        });

        return {
            connected: false,
            latency,
            lastCheck,
            error: errorMessage
        };
    }
}
