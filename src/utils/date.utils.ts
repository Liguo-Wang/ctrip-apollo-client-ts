/**
 * Provides utilities to transform hydrated and persisted data.
 */
export class DateUtils {

    // -------------------------------------------------------------------------
    // Public Static Methods
    // -------------------------------------------------------------------------

    /**
     * Normalizes date object hydrated from the database.
     */
    static normalizeHydratedDate(mixedDate: Date|string|undefined): Date|string|undefined {
        if (!mixedDate)
            return mixedDate;

        return typeof mixedDate === "string" ? new Date(mixedDate) : mixedDate as Date;
    }

    /**
     * Converts given value into date string in a "YYYY-MM-DD" format.
     */
    static mixedDateToDateString(value: string|Date): string {
        if (value instanceof Date)
            return this.formatZerolessValue(value.getFullYear()) + "-" + this.formatZerolessValue(value.getMonth() + 1) + "-" + this.formatZerolessValue(value.getDate());

        return value;
    }

    /**
     * Converts given string value with "-" separator into a "HH:mm:ss" format.
     */
    static mixedTimeToString(value: string|any, skipSeconds: boolean = false): string|any {
        value = value instanceof Date ? (value.getHours() + ":" + value.getMinutes() + (!skipSeconds ? ":" + value.getSeconds() : "")) : value;
        if (typeof value === "string") {
            return value.split(":")
                .map(v => v.length === 1 ? "0" + v : v) // append zero at beginning if we have a first-zero-less number
                .join(":");
        }

        return value;
    }


    /**
     * Converts given string to simple array split by "," separator.
     */
    static stringToSimpleArray(value: string|any): string|any {
        if (value instanceof String || typeof value === "string") {
            if (value.startsWith('[') && value.endsWith(']')) {
              return JSON.parse(value as string);  
            }
            if (value.length > 0) {
                return value.split(",");
            } else {
                return [];
            }
        }

        return value;
    }


    // -------------------------------------------------------------------------
    // Private Static Methods
    // -------------------------------------------------------------------------

    /**
     * Formats given number to "0x" format, e.g. if it is 1 then it will return "01".
     */
    private static formatZerolessValue(value: number): string {
        if (value < 10)
            return "0" + value;

        return String(value);
    }
}
