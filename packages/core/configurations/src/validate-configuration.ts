export class ValidateConfiguration {
    emptyString(value?: string | null | number): void {
        const valueToString = String(value);
        if (valueToString?.length === 0 || valueToString === "undefined" || valueToString === "null") {
            throw new Error(`
        Configuration load empty
        `);
        }
    }
}
