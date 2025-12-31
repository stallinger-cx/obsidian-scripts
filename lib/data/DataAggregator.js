/**
 * Class representing a point.
 * @class
 */

class DataAggregator {

    static Instance = class {

        #descriptor
        get _descriptor() { return this.#descriptor; }

        constructor(descriptor) {
            if (!descriptor) { // ToDo: check for descriptor type!
                throw new Error(`Descriptor instance required!`);
            }
            this.#descriptor = descriptor;
        }

        /**
         * Groups an array (DataView-like).
         * @param {Array} entries - Array to group
         * @param {String|Function} groupByKeyGetter - Property name or function() to get the key.
         * @returns {Array<{key: any, rows: Array}>}
         */
        groupBy(entries, groupByKeyGetter) {
            const map = new Map();
            entries.forEach((item) => {
                const rawKey = (typeof groupByKeyGetter === 'function') ? groupByKeyGetter(item) : item[groupByKeyGetter];
                const groupKey = rawKey?.path ?? rawKey; // todo: put to utils, see entryMatchesFilter()
                if (!map.has(groupKey)) {
                    // Wir speichern im 'key' Feld der Gruppe trotzdem den rawKey (das Link-Objekt),
                    // damit du es im Frontend später noch anklicken kannst!
                    // Wenn es Strings waren, ist rawKey == groupKey.
                    map.set(groupKey, { key: rawKey, rows: [] });
                }
                map.get(groupKey).rows.push(item);
            });
            // convert
            return Array.from(map.values());
        }

        // Groups entries by field name, gets most recent entry per group (by 'created' field)
        getLatestPerGroup(entries, groupByFieldName, mostRecentIdentifier = 'created') {
            this._descriptor.pushMethod("getLatestPerGroup");
            this._descriptor.push(`Grouping \`${entries.length}\` entries`, 1);
            if (!entries || entries.length === 0) return entries;
            this._descriptor.push(`GroupBy: \`${groupByFieldName}\``, 2);
            this._descriptor.push(`Identifier: \`${mostRecentIdentifier}\``, 2);
            //const grouped = entries.groupBy(e => e[groupByFieldName]); // former: dataview-Group
            const grouped = this.groupBy(entries, groupByFieldName);
            return grouped
                .map(group => {
                    return group.rows.reduce((prev, curr) =>
                        (curr[mostRecentIdentifier] > prev[mostRecentIdentifier]) ? curr : prev
                );
            });
        }

        getTotal(entries, sumFieldName) {
            this._descriptor.pushMethod("getTotal");
            this._descriptor.push(`Sum of \`${sumFieldName}\` over \`${entries.length}\` entries.`, 1);
            const arr = entries?.array?.() ?? Array.from(entries || []);
            return arr
                .filter(p => p[sumFieldName] !== 0.0)
                .map(p => p[sumFieldName])
                .reduce((acc, val) => acc + val, 0.0);
        }
    }

    create(descriptor) {
        return new DataAggregator.Instance(descriptor);
    }
}
