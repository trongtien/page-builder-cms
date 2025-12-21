import { ValidateConfiguration } from "./validate-configuration";

export class DatabaseConfiguration extends ValidateConfiguration {
    host: string;
    port: number;
    dbName: string;
    dbSchema: string;
    username: string;
    password: string;

    constructor() {
        super();
        this.host = process.env.DB_HOST || "";
        this.port = parseInt(process.env.DB_PORT || "0", 10);
        this.dbName = process.env.DB_NAME || "";
        this.dbSchema = process.env.DB_SCHEMA || "";
        this.username = process.env.DB_USERNAME || "";
        this.password = process.env.DB_PASSWORD || "";
        this.validate();
    }

    private validate() {
        this.emptyString(this.host);
        this.emptyString(this.port);
    }
}
