// @ts-check

/**
 * @fileoverview
 * @description
 */

/**
 * @typedef {InstanceType<typeof DataSorter.Instance>} DataSorterInstance
 * @classdesc
 */
class DataSorter {

    static Instance = class {

        #descriptor
        get _descriptor() { return this.#descriptor; }

        constructor(descriptor) {
            if (!descriptor) { // ToDo: check for descriptor type!
                throw new Error(`Descriptor instance required!`);
            }
            this.#descriptor = descriptor;
        }

        _getVal(obj, path) {
            if (obj === null || obj === undefined) return "";
            if (!path || path === "" || typeof obj !== 'object') { return obj; }
            // Try to resolve path
            try {
                return path.split('.').reduce((o, key) => {
                    if (o === null || o === undefined) return null;
                    return o[key];
                }, obj);
            } catch (e) {
                return null;
            }
        }

        /**
         * Sorts for multiple fields.
         * @param {Array} entries - Entries as native Array!
         * @param {Array} sortConfig - Config: [{ key: 'feld', desc: true/false }]
         */
        sort(entries, sortConfig) {
            this._descriptor.pushMethod("sort");
            for (const field of sortConfig) {
                this._descriptor.push(`by \`${field.key}\`${field.desc ? ' (\`descending\`)' : ''}`, 2);
            }
            return entries.toSorted((a, b) => {
                for (const field of sortConfig) {
                    const key = field.key;
                    const isDesc = field.desc || false; // default: ascending
                    const valA = this._getVal(a, key);
                    const valB = this._getVal(b, key);
                    let comparison = 0;
                    // Compare
                    if ((typeof valA === 'number') && (typeof valB === 'number')) {
                        comparison = valA - valB;
                    } else {
                        comparison = String(valA).localeCompare(String(valB));
                    }
                    if (comparison !== 0) {
                        return isDesc ? comparison * -1 : comparison;
                    }
                }
                return 0;
            });
        }
    }

    create(descriptor) {
        return new DataSorter.Instance(descriptor);
    }
}
