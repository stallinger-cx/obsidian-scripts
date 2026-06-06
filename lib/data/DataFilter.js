// @ts-check

/**
 * @fileoverview
 * @description
 */

/**
 * @typedef {InstanceType<typeof DataFilter.Instance>} DataFilterInstance
 * @classdesc
 */
class DataFilter {

    static Instance = class {

        #descriptor
        get _descriptor() { return this.#descriptor; }

        constructor(descriptor) {
            if (!descriptor) { // ToDo: check for descriptor type!
                throw new Error(`Descriptor instance required!`);
            }
            this.#descriptor = descriptor;
        }

        // this function checks if the entry matches the filter
        // it can handle both string and object entries, where the object has a 'path' property
        // todo: put to utils
        _entryMatchesFilter(entry, filter) {
            const unwrap = (val) => val?.path ?? val;
            return unwrap(entry) === unwrap(filter);
        }

        filter(entries, filterKeys, filterValues) {
            filterKeys = [].concat(filterKeys || []);
            filterValues = [].concat(filterValues || []);
            if (filterKeys.length > 0) {
                this._descriptor.pushMethod('filter');
                this._descriptor.push(`filterKeys: \`${filterKeys}\`;`, 2);
                this._descriptor.push(`filterValues: \`${filterValues}\`;`, 2);
                if (filterValues.length !== filterKeys.length) {
                    throw new Error("filterKeys and filterValues length mismatch!");
                }
                const filteredEntries = entries.filter(p => {
                    for (let i = 0; i < filterKeys.length; i++) {
                        const filterKey = filterKeys[i];
                        if (!filterKey) throw new Error("filterKey must not be empty!");
                        const filterValue = filterValues[i];
                        const property = [].concat(p[filterKey] ?? []);
                        if (!property.some(entry => this._entryMatchesFilter(entry, filterValue))) {
                            return false;
                        }
                    }
                    return true;
                });
                return filteredEntries;
            } else {
                return entries;
            }
        }

        // Filter cost-related entries: only those with `cost` or `cost_income` defined, and no `cost_per` defined
        filterCostRelatedEntries(entries) {
            const c = customJS.Constants;
            this._descriptor.pushMethod("filterCostRelatedEntries");
            this._descriptor.push(
                `Filtering entries with \`${c.PROPERTY.COST.COST}\` or \`${c.PROPERTY.COST.INCOME}\` defined and where \`${c.PROPERTY.COST.PER}\` is not set.`, 1);
            return entries
                .filter(p =>
                    // cost properties exist
                    !((p[c.PROPERTY.COST.COST] === undefined)
                        && (p[c.PROPERTY.COST.INCOME] === undefined))
                    // cost only, where no 'cost_per' is set
                    && !(typeof p[c.PROPERTY.COST.PER] === 'number')
                );
        }

        /**
         * Helper: Filtert eine Liste von Tags anhand eines Prefix.
         *
         * @param {string[]} tags - Die Tags (z.B. page.file.tags).
         * @param {string} prefix - Z.B. "finance/asset/".
         * @returns {string[]} - Die gefilterten Tags.
         */
        filterTagsByPrefix(tags, prefix) {
            // FIXME
            // TODO: !
            if (!tags || tags.length === 0) return [];
            if (!prefix) return tags; // Kein Filter? Alles zurückgeben.

            const search = prefix.startsWith('#') ? prefix : `#${prefix}`;

            // Wir filtern nur
            return tags.filter(t => t.startsWith(search));
        }
    }

    create(descriptor) {
        return new DataFilter.Instance(descriptor);
    }
}
