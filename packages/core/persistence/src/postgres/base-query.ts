import type { Knex } from "knex";
import { DatabaseClient } from "./client";
import { persistenceLogger } from "../logger";
import type {
    PaginationOptions,
    PaginationResult,
    QueryOptions,
    WhereCondition,
    InsertData,
    UpdateData
} from "./postgres.type";

export abstract class BaseQuery<T = unknown> {
    protected tableName: string;
    protected dbClient: DatabaseClient;
    protected softDelete: boolean;
    protected deletedAtColumn: string;

    constructor(tableName: string, options?: { softDelete?: boolean; deletedAtColumn?: string }) {
        this.tableName = tableName;
        this.dbClient = DatabaseClient.getInstance();
        this.softDelete = options?.softDelete ?? false;
        this.deletedAtColumn = options?.deletedAtColumn ?? "deleted_at";
    }

    protected getQueryBuilder(trx?: Knex.Transaction): Knex.QueryBuilder {
        const knex = trx || this.dbClient.getKnexSync();
        let query = knex(this.tableName);

        // Exclude soft-deleted records by default
        if (this.softDelete) {
            query = query.whereNull(this.deletedAtColumn);
        }

        return query;
    }

    protected applyQueryOptions(query: Knex.QueryBuilder, options?: QueryOptions): Knex.QueryBuilder {
        if (!options) return query;

        if (options.fields && options.fields.length > 0) {
            query = query.select(options.fields);
        }

        if (options.orderBy && options.orderBy.length > 0) {
            options.orderBy.forEach(({ column, order = "asc" }) => {
                query = query.orderBy(column, order);
            });
        }

        if (options.limit) {
            query = query.limit(options.limit);
        }

        if (options.offset) {
            query = query.offset(options.offset);
        }

        if (options.withDeleted && this.softDelete) {
            query = query.clearWhere().from(this.tableName);
        }

        return query;
    }

    public async findAll(options?: QueryOptions, trx?: Knex.Transaction): Promise<T[]> {
        // Ensure connection
        if (!trx) await this.dbClient.connect();

        try {
            let query = this.getQueryBuilder(trx);
            query = this.applyQueryOptions(query, options);

            const results = (await query) as T[];

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "findAll",
                count: results.length
            });

            return results;
        } catch (error) {
            persistenceLogger.error("Query failed", {
                table: this.tableName,
                operation: "findAll",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async paginate(
        pagination: PaginationOptions,
        options?: QueryOptions,
        trx?: Knex.Transaction
    ): Promise<PaginationResult<T>> {
        const page = pagination.page || 1;
        const limit = pagination.limit || 10;
        const offset = pagination.offset ?? (page - 1) * limit;

        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            // Get total count
            const countQuery = this.getQueryBuilder(trx);
            const countResult = (await countQuery.count("* as count")) as Array<{ count: string | number }>;
            const total = Number(countResult[0].count);

            // Get paginated data
            let dataQuery = this.getQueryBuilder(trx);
            dataQuery = this.applyQueryOptions(dataQuery, options);
            dataQuery = dataQuery.limit(limit).offset(offset);

            const data = (await dataQuery) as T[];

            const totalPages = Math.ceil(total / limit);

            persistenceLogger.query(dataQuery.toQuery(), {
                table: this.tableName,
                operation: "paginate",
                page,
                limit,
                total
            });

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages,
                    hasNext: page < totalPages,
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            persistenceLogger.error("Pagination query failed", {
                table: this.tableName,
                operation: "paginate",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    /**
     * Find one record by conditions
     */
    public async findOne(where: WhereCondition, options?: QueryOptions, trx?: Knex.Transaction): Promise<T | null> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            let query = this.getQueryBuilder(trx);
            query = query.where(where);
            query = this.applyQueryOptions(query, options);
            query = query.first();

            const result = (await query) as T | undefined;

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "findOne",
                found: !!result
            });

            return result || null;
        } catch (error) {
            persistenceLogger.error("Query failed", {
                table: this.tableName,
                operation: "findOne",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    /**
     * Find record by ID
     */
    public async findById(id: number | string, options?: QueryOptions, trx?: Knex.Transaction): Promise<T | null> {
        return this.findOne({ id }, options, trx);
    }

    /**
     * Find records by conditions
     */
    public async findWhere(where: WhereCondition, options?: QueryOptions, trx?: Knex.Transaction): Promise<T[]> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            let query = this.getQueryBuilder(trx);
            query = query.where(where);
            query = this.applyQueryOptions(query, options);

            const results = (await query) as T[];

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "findWhere",
                count: results.length
            });

            return results;
        } catch (error) {
            persistenceLogger.error("Query failed", {
                table: this.tableName,
                operation: "findWhere",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    /**
     * Insert one or multiple records
     */
    public async insert(data: InsertData<T>, trx?: Knex.Transaction): Promise<T[]> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            const knex = trx || this.dbClient.getKnexSync();
            const query = knex(this.tableName).insert(data).returning("*");

            const results = (await query) as T | T[];

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "insert",
                count: Array.isArray(results) ? results.length : 1
            });

            return Array.isArray(results) ? results : [results];
        } catch (error) {
            persistenceLogger.error("Insert failed", {
                table: this.tableName,
                operation: "insert",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async insertOne(data: Partial<T>, trx?: Knex.Transaction): Promise<T> {
        const results = await this.insert(data, trx);
        return results[0];
    }

    public async update(where: WhereCondition, data: UpdateData<T>, trx?: Knex.Transaction): Promise<T[]> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            const knex = trx || this.dbClient.getKnexSync();
            let query = knex(this.tableName).where(where);

            if (this.softDelete) {
                query = query.whereNull(this.deletedAtColumn);
            }

            const results = (await query.update(data).returning("*")) as T | T[];

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "update",
                count: Array.isArray(results) ? results.length : 1
            });

            return Array.isArray(results) ? results : [results];
        } catch (error) {
            persistenceLogger.error("Update failed", {
                table: this.tableName,
                operation: "update",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async updateById(id: number | string, data: UpdateData<T>, trx?: Knex.Transaction): Promise<T | null> {
        const results = await this.update({ id }, data, trx);
        return results[0] || null;
    }

    public async delete(where: WhereCondition, trx?: Knex.Transaction): Promise<number> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            const knex = trx || this.dbClient.getKnexSync();
            let query = knex(this.tableName).where(where);

            let affectedRows: number;

            if (this.softDelete) {
                // Soft delete
                query = query.whereNull(this.deletedAtColumn);
                const results = (await query.update({ [this.deletedAtColumn]: new Date() })) as number | unknown[];
                affectedRows = Array.isArray(results) ? results.length : results;
            } else {
                // Hard delete
                affectedRows = await query.del();
            }

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: this.softDelete ? "softDelete" : "delete",
                affectedRows
            });

            return affectedRows;
        } catch (error) {
            persistenceLogger.error("Delete failed", {
                table: this.tableName,
                operation: "delete",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async deleteById(id: number | string, trx?: Knex.Transaction): Promise<boolean> {
        const affectedRows = await this.delete({ id }, trx);
        return affectedRows > 0;
    }

    public async forceDelete(where: WhereCondition, trx?: Knex.Transaction): Promise<number> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            const knex = trx || this.dbClient.getKnexSync();
            const query = knex(this.tableName).where(where);
            const affectedRows = await query.del();

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "forceDelete",
                affectedRows
            });

            return affectedRows;
        } catch (error) {
            persistenceLogger.error("Force delete failed", {
                table: this.tableName,
                operation: "forceDelete",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async restore(where: WhereCondition, trx?: Knex.Transaction): Promise<T[]> {
        if (!this.softDelete) {
            throw new Error("Restore is only available for tables with soft delete enabled");
        }

        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            const knex = trx || this.dbClient.getKnexSync();
            const query = knex(this.tableName).where(where).whereNotNull(this.deletedAtColumn);

            const results = (await query.update({ [this.deletedAtColumn]: null }).returning("*")) as T | T[];

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "restore",
                count: Array.isArray(results) ? results.length : 1
            });

            return Array.isArray(results) ? results : [results];
        } catch (error) {
            persistenceLogger.error("Restore failed", {
                table: this.tableName,
                operation: "restore",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async count(where?: WhereCondition, trx?: Knex.Transaction): Promise<number> {
        try {
            if (!trx) {
                await this.dbClient.connect();
            }

            let query = this.getQueryBuilder(trx);

            if (where) {
                query = query.where(where);
            }

            const countResult = (await query.count("* as count")) as Array<{ count: string | number }>;

            persistenceLogger.query(query.toQuery(), {
                table: this.tableName,
                operation: "count",
                count: Number(countResult[0].count)
            });

            return Number(countResult[0].count);
        } catch (error) {
            persistenceLogger.error("Count query failed", {
                table: this.tableName,
                operation: "count",
                error: error instanceof Error ? error.message : "Unknown error"
            });
            throw error;
        }
    }

    public async exists(where: WhereCondition, trx?: Knex.Transaction): Promise<boolean> {
        const count = await this.count(where, trx);
        return count > 0;
    }

    public async query(trx?: Knex.Transaction): Promise<Knex.QueryBuilder> {
        return this.getQueryBuilder(trx);
    }
}
