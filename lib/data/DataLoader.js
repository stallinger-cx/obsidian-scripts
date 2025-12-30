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

        /**
         *
         * @param {DataviewApi} dv
         * @param {InstanceType<typeof DataFilter.Instance>} filter
         * @param {InstanceType<typeof Descriptor.Instance>} descriptor
         */
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
            if (!folder) {throw new Error('folder required!'); }
            let baseFilterString = `"${folder}"`;
            tags = [].concat(tags || []);
            if (tags.length > 0) {
                const tagFilters = tags.map(t => `${t}`).join(" OR ");
                baseFilterString += ` AND ( ${tagFilters} )`;
            }
            return baseFilterString;
        }

        // ToDo: implement recursive relates_to resolution, check for recursions -> filter out multiple occurrences (possible multiple paths)!

        /**
         * Loads notes by param
         * @param {InstanceType<typeof DataParams.FilterContext>} filterContext - filter object, see DataParams
         * @returns {Array} - data pages
         */
        getNotesFilteredObj(filterContext) {
            return this.getNotesFiltered(
                filterContext.firstFolder, // todo: enable the function to load multiple folders
                filterContext.tags,
                filterContext.filterKeys,
                filterContext.filterValues);
        }

        /**
         * Loads notes by param
         * ToDo: use filterContext - only!
         * @param {string} folder - notes folder (e.g. "notes").
         * @param {string[]} tags - filterTags (e.g. ['#finance', '#finance/asset']).
         * @param {string[]} filterKeys - filterKeys must be string (e.g. ['relates_to', 'owners']).
         * @param {any[]} filterValues - filterValue must be string or Obsidian link (object with 'path' property).
         * @returns {Array} - data pages
         */
        getNotesFiltered(folder, tags, filterKeys, filterValues)
        {
            let baseFilterString = this._generateBaseFilterString(folder, tags);
            let entries = this._dv.pages(`${baseFilterString}`);

            this._descriptor.pushMethod("getNotesFiltered");
            this._descriptor.push(`BaseFilter: \`${baseFilterString}\``, 1);

            return this._filter.filter(entries, filterKeys, filterValues);
            // ToDo: DataView-Agnostics: return value to array, when groupBy in DataAggregator adapted -> .array();
        }
    }

    // creates a new instance of DataViewTools
    create(dv, filter, descriptor) {
        return new DataLoader.Instance(dv, filter, descriptor);
    }
}
