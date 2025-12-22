import { describe, it, expect, beforeEach, vi } from "vitest";
import { RedisConfigBuilder } from "../config";

describe("RedisConfigBuilder", () => {
    beforeEach(() => {
        // Clear environment variables
        delete process.env.REDIS_HOST;
        delete process.env.REDIS_PORT;
        delete process.env.REDIS_PASSWORD;
        delete process.env.REDIS_DB;
        delete process.env.REDIS_TLS;
        delete process.env.REDIS_KEY_PREFIX;
        delete process.env.NODE_ENV;
    });

    describe("Default configuration", () => {
        it("should use default values when no config is provided", () => {
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.host).toBe("localhost");
            expect(config.port).toBe(6379);
            expect(config.db).toBe(0);
            expect(config.family).toBe(4);
            expect(config.tls).toBe(false);
            expect(config.password).toBeUndefined();
            expect(config.keyPrefix).toBeUndefined();
        });

        it("should set default maxRetriesPerRequest", () => {
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.maxRetriesPerRequest).toBe(3);
        });

        it("should set default enableReadyCheck to true", () => {
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.enableReadyCheck).toBe(true);
        });

        it("should set default enableOfflineQueue to true", () => {
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.enableOfflineQueue).toBe(true);
        });
    });

    describe("Environment variable configuration", () => {
        it("should read REDIS_HOST from environment", () => {
            process.env.REDIS_HOST = "redis.example.com";
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.host).toBe("redis.example.com");
        });

        it("should read REDIS_PORT from environment", () => {
            process.env.REDIS_PORT = "6380";
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.port).toBe(6380);
        });

        it("should read REDIS_PASSWORD from environment", () => {
            process.env.REDIS_PASSWORD = "secret123";
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.password).toBe("secret123");
        });

        it("should read REDIS_DB from environment", () => {
            process.env.REDIS_DB = "5";
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.db).toBe(5);
        });

        it("should read REDIS_TLS from environment", () => {
            process.env.REDIS_TLS = "true";
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.tls).toBe(true);
        });

        it("should read REDIS_KEY_PREFIX from environment", () => {
            process.env.REDIS_KEY_PREFIX = "myapp:";
            const builder = new RedisConfigBuilder();
            const config = builder.build();

            expect(config.keyPrefix).toBe("myapp:");
        });
    });

    describe("Programmatic configuration override", () => {
        it("should allow setting host via setter", () => {
            const builder = new RedisConfigBuilder();
            builder.setHost("custom.redis.com");
            const config = builder.build();

            expect(config.host).toBe("custom.redis.com");
        });

        it("should allow setting port via setter", () => {
            const builder = new RedisConfigBuilder();
            builder.setPort(7000);
            const config = builder.build();

            expect(config.port).toBe(7000);
        });

        it("should allow setting password via setter", () => {
            const builder = new RedisConfigBuilder();
            builder.setPassword("password123");
            const config = builder.build();

            expect(config.password).toBe("password123");
        });

        it("should allow setting database via setter", () => {
            const builder = new RedisConfigBuilder();
            builder.setDatabase(10);
            const config = builder.build();

            expect(config.db).toBe(10);
        });

        it("should allow setting TLS via setter", () => {
            const builder = new RedisConfigBuilder();
            builder.setTLS(true);
            const config = builder.build();

            expect(config.tls).toBe(true);
        });

        it("should allow setting key prefix via setter", () => {
            const builder = new RedisConfigBuilder();
            builder.setKeyPrefix("prefix:");
            const config = builder.build();

            expect(config.keyPrefix).toBe("prefix:");
        });

        it("should support method chaining", () => {
            const builder = new RedisConfigBuilder();
            builder.setHost("chained.redis.com").setPort(8000).setDatabase(3).setTLS(true);

            const config = builder.build();

            expect(config.host).toBe("chained.redis.com");
            expect(config.port).toBe(8000);
            expect(config.db).toBe(3);
            expect(config.tls).toBe(true);
        });

        it("should override environment variables with programmatic config", () => {
            process.env.REDIS_HOST = "env.redis.com";
            const builder = new RedisConfigBuilder();
            builder.setHost("override.redis.com");
            const config = builder.build();

            expect(config.host).toBe("override.redis.com");
        });
    });

    describe("Configuration validation", () => {
        it("should validate successfully with valid config", () => {
            const builder = new RedisConfigBuilder();
            expect(builder.validate()).toBe(true);
        });

        it("should throw error for invalid port (negative)", () => {
            const builder = new RedisConfigBuilder();
            expect(() => builder.setPort(-1)).toThrow("Invalid port number");
        });

        it("should throw error for invalid port (> 65535)", () => {
            const builder = new RedisConfigBuilder();
            expect(() => builder.setPort(70000)).toThrow("Invalid port number");
        });

        it("should throw error for invalid database index (negative)", () => {
            const builder = new RedisConfigBuilder();
            expect(() => builder.setDatabase(-1)).toThrow("Invalid database index");
        });

        it("should throw error for invalid database index (> 15)", () => {
            const builder = new RedisConfigBuilder();
            expect(() => builder.setDatabase(16)).toThrow("Invalid database index");
        });

        it("should return false for empty host", () => {
            const builder = new RedisConfigBuilder({ config: { host: "" } });
            expect(builder.validate()).toBe(false);
        });
    });

    describe("Connection string generation", () => {
        it("should generate connection string without TLS", () => {
            const builder = new RedisConfigBuilder();
            const connString = builder.getConnectionString();

            expect(connString).toBe("redis://localhost:6379/0");
        });

        it("should generate connection string with TLS", () => {
            const builder = new RedisConfigBuilder();
            builder.setTLS(true);
            const connString = builder.getConnectionString();

            expect(connString).toBe("rediss://localhost:6379/0");
        });

        it("should not include password in connection string", () => {
            const builder = new RedisConfigBuilder();
            builder.setPassword("secret123");
            const connString = builder.getConnectionString();

            expect(connString).not.toContain("secret123");
            expect(connString).toBe("redis://localhost:6379/0");
        });

        it("should generate connection string with custom host, port, and db", () => {
            const builder = new RedisConfigBuilder();
            builder.setHost("prod.redis.com").setPort(7000).setDatabase(5);
            const connString = builder.getConnectionString();

            expect(connString).toBe("redis://prod.redis.com:7000/5");
        });
    });

    describe("buildIORedisConfig", () => {
        it("should generate ioredis-compatible configuration", () => {
            const builder = new RedisConfigBuilder();
            const ioConfig = builder.buildIORedisConfig();

            expect(ioConfig.host).toBe("localhost");
            expect(ioConfig.port).toBe(6379);
            expect(ioConfig.db).toBe(0);
        });

        it("should include TLS configuration in production", () => {
            process.env.NODE_ENV = "production";
            const builder = new RedisConfigBuilder();
            builder.setTLS(true);
            const ioConfig = builder.buildIORedisConfig();

            expect(ioConfig.tls).toBeDefined();
            expect(ioConfig.tls).toHaveProperty("rejectUnauthorized", true);
        });

        it("should include TLS configuration in development (rejectUnauthorized=false)", () => {
            process.env.NODE_ENV = "development";
            const builder = new RedisConfigBuilder();
            builder.setTLS(true);
            const ioConfig = builder.buildIORedisConfig();

            expect(ioConfig.tls).toBeDefined();
            expect(ioConfig.tls).toHaveProperty("rejectUnauthorized", false);
        });

        it("should include retry strategy", () => {
            const builder = new RedisConfigBuilder();
            const ioConfig = builder.buildIORedisConfig();

            expect(ioConfig.retryStrategy).toBeDefined();
            expect(typeof ioConfig.retryStrategy).toBe("function");
        });

        it("should calculate retry delay correctly", () => {
            const builder = new RedisConfigBuilder();
            const ioConfig = builder.buildIORedisConfig();
            const retryStrategy = ioConfig.retryStrategy!;

            // First retry: 50ms
            expect(retryStrategy(1)).toBe(50);
            // Second retry: 100ms
            expect(retryStrategy(2)).toBe(100);
            // 40th retry: capped at 2000ms
            expect(retryStrategy(40)).toBe(2000);
        });
    });

    describe("Build with options", () => {
        it("should accept partial config in constructor", () => {
            const builder = new RedisConfigBuilder({
                config: {
                    host: "configured.redis.com",
                    port: 6380,
                    password: "mypassword",
                    db: 3
                }
            });
            const config = builder.build();

            expect(config.host).toBe("configured.redis.com");
            expect(config.port).toBe(6380);
            expect(config.password).toBe("mypassword");
            expect(config.db).toBe(3);
        });

        it("should throw error on invalid configuration during build", () => {
            const builder = new RedisConfigBuilder({ config: { host: "" } });
            expect(() => builder.build()).toThrow("Invalid Redis configuration");
        });
    });
});
