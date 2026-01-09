// @ts-check

/**
 * @fileoverview
 * @description
 */

/**
 * @classdesc For implementation hint, see global CellFormatter type.
 */
class ViewFormatter {

    /**
     *
     * @param {any} value
     * @returns {boolean}
     */
    _isDate(value) {
        return (value instanceof Date)
            || (value && (typeof value.toJSDate === 'function'))
            || (moment && moment.isMoment(value));
    }

    /**
     *
     * @param {any} value
     * @returns {boolean}
     */
    _isLink(value) {
        return (value && value.path); // ToDo: in utils class for link detection!
    }

    /**
     *
     * @param {any} value
     * @returns {boolean}
     */
    _isTag(value) {
        return ((typeof value === 'string') && value.trim().startsWith('#'));
    }

    /**
     * Formats arrays as markdown lists.
     * @param {any[]} value
     * @param {function} perItemFormatter - function to format each item
     * @returns {string} - Returns a formatted markdown string
     */
    _fromArray(value, perItemFormatter)
    {
        if (Array.isArray(value)) {
            const formatter = perItemFormatter || ((/** @type {any} */ v) => v ?? null);
            const listItems = value
                .map((v, i) => {
                    const val = formatter(v);
                    let elementSpacing = '0.0em';
                    if (this._isTag(val)) { elementSpacing = '0.3em'; }
                    let style = 'text-align: left'; // ToDo: text-align per config?
                    if ((i < (value.length - 1))
                        && (elementSpacing && (elementSpacing !== '0.0em')))
                    {
                        style += `; margin-bottom: ${elementSpacing};`;
                    }
                    return `<li style="${style}">${val}</li>`;
                })
                .join("");
            return `<ul style="margin: 0; padding-inline-start: 0em;">${listItems}</ul>`;
        }
        return value;
    }

    /**
     *
     * @param {number} value
     * @param {boolean} currency
     * @returns {string|null} - Input: 1234.5 -> Output: "1'234.50" or "€ 1'234.50"
     */
    _toFixedFormat(value, currency){
        if (typeof value !== 'number') return null;
        let settings = {
            useGrouping: true
        };
        if (currency) {
            settings.style = 'currency';
            settings.currency = 'EUR';
        } else {
            settings.minimumFractionDigits = 2;
            settings.maximumFractionDigits = 2;
        }
        let localizedValue = value.toLocaleString('en-US', settings);
        return localizedValue.replace(/,/g, "'");
    }

    /**
     * Wrapper
     * @param {any|any[]} value - Input
     * @param {Function} perItemFunc - Function to format a single item
     */
    _auto(value, perItemFunc) {
        if (Array.isArray(value)) {
            return this._fromArray(value, perItemFunc);
        }
        return perItemFunc(value);
    }

    // ToDo: extract align functions to a separate AlignFormatter class?

    /**
     *
     * @param {any} value
     */
    alignLeft(value) {
        return `<div style="text-align: left;">${value ?? ""}</div>`;
    }

    /**
     *
     * @param {any} value
     */
    alignRight(value) {
        return `<div style="text-align: right;">${value ?? ""}</div>`;
    }

    /**
     *
     * @param {any} value
     */
    alignCenter(value) {
        return `<div style="text-align: center;">${value ?? ""}</div>`;
    }

    /**
     * Disables wrapping for the given value.
     * @param {any} value
     * @returns {string}
     */
    nowrap(value) {
        return `<span style="white-space: nowrap;">${value ?? ""}</span>`;
    }

    /**
     * Formats currencies.
     * @param {number|number[]} value
     * @returns {string} - Input: 1234.5 -> Output: "1'234.50 €"
     */
    currency(value) {
        return this._auto(value, (/** @type {number} */ v) => this._toFixedFormat(v, true));
    }

    /**
     * Formats simple decimal numbers.
     * @param {number|number[]} value
     * @returns {string} - Input: 1234.5 -> Output: "1'234.50"
     */
    number(value) {
        return this._auto(value, (/** @type {number} */ v) => this._toFixedFormat(v, false));
    }

    /**
     * Formats dates.
     * @param {Date|moment|any|Date[]|moment[]|any[]} value
     * @returns {string} - Input: Date Object -> Output: "DD.MM.YYYY"
     */
    date(value) {
        return this._auto(value, (/** @type {Date|moment|any} */ val) => {
            if (!val) return null;
            if (val.toJSDate) val = val.toJSDate(); // support for dataview Luxon objects
            return moment(val).format("YYYY-MM-DD");
        });
    }

    /**
     * Checkbox formatter.
     * @param {boolean|any|boolean[]|any[]} value
     * @returns {string} - Input: true/false -> Output: "✅"/"❌"
     */
    boolean(value) {
        return this._auto(value, (/** @type {boolean|any} */ val) => {
            return val ? "✅" : "❌";
        });
    }

    /**
     * Extracts links (Dataview Link Objekt) - todo: see other link extractors!
     * @param {DataElementLink|string|DataElementLink[]|string[]} value
     * @returns {string|any|null} - Input: Link Object -> Output: Obsidian [[Link]] (string)
     */
    link(value) {
        return this._auto(value, (/** @type {DataElementLink|string} */ val) => {
            return (val && val.path) ? val.toString() : null;
        });
    }

    /**
     *
     * @param {string|string[]} value
     * @returns {string|null} - Input: "tag" or ["tag1", "tag2"] -> Output: "#tag1 #tag2"
     */
    hashtag(value) {
        return this._auto(value, (/** @type {string} */ val) => {
            if (val && (typeof val === 'string'))
            {
                return val.startsWith("#") ? val : `#${val}`;
            }
            return null;
        });
    }

    /**
     *
     * @param {any|any[]} value
     * @returns {any} - Returns a string or an obsidian link or tag object
     */
    default(value) {
        return this._auto(value, (/** @type {any} */ val) => {
            if (this._isDate(val)) {
                return this.date(val);
            }
            if (this._isLink(val)) {
                return this.link(val);
            }
            if (this._isTag(val)) {
                return this.hashtag(val);
            }
            return val ?? null;
        });
    }
}
