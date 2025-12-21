import { ValidateConfiguration } from "./validate-configuration";

export class HostConfiguration extends ValidateConfiguration {
    host?: string;
    port?: number | null;

    constructor() {
        super();
        this.host = process.env.HOST || "";
        this.port = parseInt(process.env.PORT || "0", 10);
        this.validate();
    }

    private validate() {
        this.emptyString(this.host);
        this.emptyString(this.port);
    }
}
