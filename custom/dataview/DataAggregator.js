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

        // Groups entries by field name, gets most recent entry per group (by 'created' field)
        getLatestPerGroup(entries, groupByFieldName, mostRecentIdentifier = 'created') {
            this._descriptor.pushMethod("getLatestPerGroup");
            this._descriptor.push(`Grouping \`${entries.length}\` entries`, 1);
            if (!entries || entries.length === 0) return entries;
            this._descriptor.push(`GroupBy: \`${groupByFieldName}\``, 2);
            this._descriptor.push(`Identifier: \`${mostRecentIdentifier}\``, 2);
            return entries
                .groupBy(e => e[groupByFieldName])
                .map(group => {
                    return group.rows.array().reduce((prev, curr) =>
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
