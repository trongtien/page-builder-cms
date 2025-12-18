import type { ValidationError } from "./node-config.type";
import { ConfigValidationError } from "./validate-error";

/**
 * JWT configuration interface
 * Single file handles all JWT-related configuration
 */
export interface JwtConfig {
    secret: string;
    expiresIn: string;
    issuer: string;
    audience: string;
    algorithm: "HS256" | "HS384" | "HS512" | "RS256";
}

/**
 * Load and validate JWT configuration
 */
export function loadJwtConfig(env: Record<string, string | undefined>): JwtConfig {
    const errors: ValidationError[] = [];

    // Validate JWT secret
    const secret = env.JWT_SECRET;
    if (!secret) {
        errors.push({ field: "JWT_SECRET", message: "JWT secret is required" });
    } else if (secret.length < 32) {
        errors.push({
            field: "JWT_SECRET",
            message: "JWT secret must be at least 32 characters for security"
        });
    }

    // Validate expiration time with default
    const expiresIn = env.JWT_EXPIRES_IN || "1h";
    const validExpiresPattern = /^\d+[smhd]$/;
    if (!validExpiresPattern.test(expiresIn)) {
        errors.push({
            field: "JWT_EXPIRES_IN",
            message: "JWT expires must be in format: 30s, 15m, 1h, 7d"
        });
    }

    // Validate issuer
    const issuer = env.JWT_ISSUER?.trim();
    if (!issuer) {
        errors.push({ field: "JWT_ISSUER", message: "JWT issuer is required" });
    }

    // Validate audience
    const audience = env.JWT_AUDIENCE?.trim();
    if (!audience) {
        errors.push({ field: "JWT_AUDIENCE", message: "JWT audience is required" });
    }

    // Validate algorithm with default
    const algorithm = (env.JWT_ALGORITHM || "HS256") as JwtConfig["algorithm"];
    const validAlgorithms: JwtConfig["algorithm"][] = ["HS256", "HS384", "HS512", "RS256"];
    if (!validAlgorithms.includes(algorithm)) {
        errors.push({
            field: "JWT_ALGORITHM",
            message: `JWT algorithm must be one of: ${validAlgorithms.join(", ")}`
        });
    }

    if (errors.length > 0) {
        throw new ConfigValidationError("JWT configuration invalid", errors, env);
    }

    return {
        secret: secret!,
        expiresIn,
        issuer: issuer!,
        audience: audience!,
        algorithm
    };
}

/**
 * JWT configuration singleton
 * Loads configuration on first access
 */
let cachedJwtConfig: JwtConfig | null = null;

export function getJwtConfig(): JwtConfig {
    if (!cachedJwtConfig) {
        cachedJwtConfig = loadJwtConfig(process.env);
    }
    return cachedJwtConfig;
}

/**
 * Reset cached configuration (useful for testing)
 */
export function resetJwtConfig(): void {
    cachedJwtConfig = null;
}
