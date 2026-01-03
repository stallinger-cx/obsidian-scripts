// @ts-check

/**
 * @fileoverview Aggregator class
 * @description  Aggregates data pages (grouping, summing, etc.)
 */

/**
 * @typedef {InstanceType<typeof DataAggregator.Instance>} DataAggregatorInstance
 */

class DataAggregator {

    static Instance = class {

        #descriptor
        get _descriptor() { return this.#descriptor; }

        /**
         * Creates an instance of DataAggregator.
         * @param {DescriptorInstance} descriptor
         */
        constructor(descriptor) {
            if (!descriptor) { // ToDo: check for descriptor type!
                throw new Error(`Descriptor instance required!`);
            }
            this.#descriptor = descriptor;
        }

        /**
         * Groups an array (DataView-like).
         * @param {Array} entries - Array to group
         * @param {string|Function} groupByKeyGetter - Property name or function() to get the key.
         * @returns {Array<{key: any, rows: Array}>}- ALWAYS returns an array of group objects!
         */
        groupBy(entries, groupByKeyGetter) {
            this._descriptor.pushMethod("groupBy");
            if (!entries) return [];
            this._descriptor.push(`Grouping \`${entries.length}\` entries`, 1);
            this._descriptor.push(`GroupBy: \`${groupByKeyGetter}\``, 1);
            const map = new Map();
            entries.forEach((item) => {
                const rawKey = (typeof groupByKeyGetter === 'function')
                    ? groupByKeyGetter(item)
                    : item[groupByKeyGetter];
                const groupKey = rawKey?.path ?? rawKey; // todo: put to utils, see entryMatchesFilter()
                if (!map.has(groupKey)) {
                    // Save key as rawKey (Obsidian link-object), so it can be displayed later on!
                    map.set(groupKey, { key: rawKey, rows: [] });
                }
                map.get(groupKey).rows.push(item);
            });
            // finally convert to arary
            return Array.from(map.values());
        }

        /**
         *  Groups entries by field name, gets most recent entry per group (by 'created' field)
         * @param {Record<string, any>[]} entries - Array to group.
         * @param {string|Function} groupByKeyGetter - Property name or function() to get the key.
         * @param {string} mostRecentIdentifier - Identifier (key) to find most recent entry, date or numeric property - todo: implement as 'keyOrGetter', like groupByKeyGetter
         * @returns {Record<string, any>[]} - data pages (array of entry-objects) grouped
         */
        getLatestPerGroup(entries, groupByKeyGetter, mostRecentIdentifier = 'created') {
            const grouped = this.groupBy(entries, groupByKeyGetter);
            this._descriptor.pushMethod("getLatestPerGroup");
            if (!grouped || grouped.length === 0) return [];
            this._descriptor.push(`Identifier: \`${mostRecentIdentifier}\``, 2);
            return grouped.map(group => {
                return group.rows.reduce((prev, curr) => {
                    const currVal = curr[mostRecentIdentifier] ?? 0;
                    const prevVal = prev[mostRecentIdentifier] ?? 0;
                    return (currVal > prevVal) ? curr : prev;
                });
            });
        }

        /**
         * Sums up a numeric field over all entries.
         * @param {Array} entries - Array to sum up
         * @param {string} sumFieldName - Property name to sum up.
         * @returns {number} - Sum of the field over all entries.
         */
        getTotal(entries, sumFieldName) {
            this._descriptor.pushMethod("getTotal");
            this._descriptor.push(`Sum of \`${sumFieldName}\` over \`${entries.length}\` entries.`, 1);
            const arr = entries?.array?.() ?? Array.from(entries || []); // ToDo: fix, entries?.array? no longer required
            return arr
                .filter(p => p[sumFieldName] !== 0.0)
                .map(p => p[sumFieldName])
                .reduce((acc, val) => acc + val, 0.0);
        }
    }

    /**
     * Creates an instance of DataAggregator.
     * @param {DescriptorInstance} descriptor
     * @returns {DataAggregatorInstance}
     */
    create(descriptor) {
        return new DataAggregator.Instance(descriptor);
    }
}
