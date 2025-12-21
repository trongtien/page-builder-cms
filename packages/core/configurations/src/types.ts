/**
 * Options for loading environment files
 */
export interface EnvLoaderOptions {
    /**
     * Path to the environment file to load
     * Can be absolute or relative to process.cwd()
     * @default '.env'
     */
    path?: string;

    /**
     * Whether to override existing environment variables
     * @default false
     */
    override?: boolean;

    /**
     * Whether the file must exist (will return error if missing)
     * @default false
     */
    required?: boolean;

    /**
     * Encoding of the environment file
     * @default 'utf8'
     */
    encoding?: BufferEncoding;
}

/**
 * Result of loading an environment file
 */
export interface EnvLoaderResult {
    /**
     * Whether the environment file was successfully loaded
     */
    success: boolean;

    /**
     * Absolute path that was attempted to load
     */
    path: string;

    /**
     * Error message if loading failed
     */
    error?: string;

    /**
     * Parsed environment variables (for debugging)
     */
    parsed?: Record<string, string>;
}
