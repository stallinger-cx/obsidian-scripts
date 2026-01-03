// @ts-check

/**
 * @fileoverview
 * @description
 */

/**
 * @class
 * @classdesc For implementation hint, see global CellFormatter type.
 */
class ViewFormatters {

    /**
     * Formats currencies.
     * @param {number} value
     * @returns {string} - Input: 1234.5 -> Output: "1'234.50 €"
     */
    currency(value) {
        if (typeof value !== 'number') return "-";
        return value.toLocaleString('de-AT', {
            style: 'currency',
            currency: 'EUR'
        });
    }

    /**
     * Formats simple decimal numbers.
     * @param {number} value
     * @returns {string} - Input: 1234.5 -> Output: "1'234.50"
     */
    number(value) {
        if (typeof value !== 'number') return "";
        return value.toLocaleString('de-AT', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    /**
     * Formats dates.
     * @param {Date|any} value
     * @returns {string} - Input: Date Object -> Output: "DD.MM.YYYY"
     */
    date(value) {
        if (!value) return "";
        // Support für Dataview Luxon Objekte
        if (value.toJSDate) value = value.toJSDate();
        return moment(value).format("YYYY-MM-DD");
    }

    /**
     * Checkbox formatter.
     * @param {boolean|any} value
     * @returns {string} - Input: true/false -> Output: "✅"/"❌"
     */
    boolean(value) {
        return value ? "✅" : "❌";
    }

    /**
     * Extracts links (Dataview Link Objekt) - todo: see other link extractors!
     * @param {any} value
     * @returns {string|any} - Input: Link Object -> Output: "Link Path" (string)
     */
    link(value) {
        return value?.path ? value : (value ?? "");
    }
}
