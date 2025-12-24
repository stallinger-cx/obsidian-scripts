/**
 * Class representing a point.
 * @class
 */

class DataLoader {

    static Instance = class {

        #dv
        get _dv() { return this.#dv; }

        #filter
        get _filter() { return this.#filter; }

        #descriptor
        get _descriptor() { return this.#descriptor; }

        constructor(dv, filter, descriptor) {
            if (dv?.constructor?.name !== "DataviewInlineApi") {
                throw new Error(`DataviewInlineApi instance required!`);
            }
            this.#dv = dv;
            if (!filter) { // ToDo: check for descriptor type!
                throw new Error(`DataFilter instance required!`);
            }
            this.#filter = filter;
            if (!descriptor) { // ToDo: check for descriptor type!
                throw new Error(`Descriptor instance required!`);
            }
            this.#descriptor = descriptor;
        }

        _generateBaseFilterString(folder, tags)
        {
            let baseFilterString = `"${folder}"`;
            tags = [].concat(tags || []);
            if (tags.length > 0) {
                const tagFilters = tags.map(t => `${t}`).join(" OR ");
                baseFilterString += ` AND ( ${tagFilters} )`;
            }
            return baseFilterString;
        }

        _explainGetNotesFiltered(baseFilterString, filterKeys, filterValues) {
            this._descriptor.pushMethod("getNotesFiltered");
            this._descriptor.push(`BaseFilter: \`${baseFilterString}\``, 1);
        }

        // ToDo: implement recursive relates_to resolution, check for recursions -> filter out multiple occurrences (possible multiple paths)!

        getNotesFiltered(folder, tags, filterKeys, filterValues)
        {
            let baseFilterString = this._generateBaseFilterString(folder, tags);
            let entries = this._dv.pages(`${baseFilterString}`);

            this._descriptor.pushMethod("getNotesFiltered");
            this._descriptor.push(`BaseFilter: \`${baseFilterString}\``, 1);

            return this._filter.filter(entries, filterKeys, filterValues);
        }
    }

    // creates a new instance of DataViewTools
    create(dv, filter, descriptor) {
        return new DataLoader.Instance(dv, filter, descriptor);
    }
}
