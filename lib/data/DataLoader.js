// @ts-check

/**
 * @fileoverview DataLoader class
 * @description  Loads relevant data pages from Dataview.
 */

/**
 * @typedef {InstanceType<typeof DataLoader.Instance>} DataLoaderInstance
 * @classdesc
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
         * Creates an instance of DataLoader.
         * @param {DataLoaderApi} dv
         * @param {InstanceType<typeof DataFilter.Instance>} filter
         * @param {DescriptorInstance} descriptor
         */
        constructor(dv, filter, descriptor) {
            if (!dv) {
                throw new Error("DataLoaderAPI required!");
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

        /**
         * Generates base filter string for folders and tags.
         *
         * @param {string|string[]} folders
         * @param {string|string[]} tags
         * @returns {string}
         */
        _generateBaseFilterString(folders, tags)
        {
            const folderSet = new Set([].concat(folders || []));
            if (folderSet.size === 0) { throw new Error('At least one folder is required!'); }
            let baseFilterString = `(${[...folderSet].map(f => `"${f}"`).join(" OR ")})`;
            const tagSet = new Set([].concat(tags || []));
            if (tagSet.size > 0) {
                const tagFilters = [...tagSet].map(t => `${t}`).join(" OR ");
                baseFilterString += ` AND ( ${tagFilters} )`;
            }
            return baseFilterString;
        }

        // ToDo: implement recursive relates_to resolution, check for recursions -> filter out multiple occurrences (possible multiple paths)!

        /**
         * Loads notes by param
         *
         * @param {InstanceType<typeof DataParams.FilterContext>} filterContext - filter object, see DataParams
         * @returns {Record<string, any>[]} - data pages (array of entry-objects)
         */
        getNotesFiltered(filterContext) {
            let baseFilterString = this._generateBaseFilterString(
                    filterContext.folders,
                    filterContext.tags);
            let entries = this._dv.pages(`${baseFilterString}`).array();

            this._descriptor.pushMethod("getNotesFiltered");
            this._descriptor.push(`BaseFilter: \`${baseFilterString}\``, 1);

            return this._filter.filter(entries, filterContext.filterKeys, filterContext.filterValues);
        }

        /**
         * Loads notes by param
         *
         * @deprecated Use getNotesFiltered() instead.
         * @param {string} folder - notes folder (e.g. "notes").
         * @param {string[]} tags - filterTags (e.g. ['#finance', '#finance/asset']).
         * @param {string[]} filterKeys - filterKeys must be string (e.g. ['relates_to', 'owners']).
         * @param {(string|{path: string})[]} filterValues - string or Obsidian link (object with 'path' property).
         * @returns {Record<string, any>[]} - data pages (array of entry-objects)
         */
        getNotesFilteredCompat(folder, tags, filterKeys, filterValues)
        {
            let baseFilterString = this._generateBaseFilterString(folder, tags);
            let entries = this._dv.pages(`${baseFilterString}`).array();

            this._descriptor.pushMethod("getNotesFilteredCompat(!!)");
            this._descriptor.push(`BaseFilter: \`${baseFilterString}\``, 1);

            return this._filter.filter(entries, filterKeys, filterValues);
        }
    }

    /**
     * Creates an instance of DataLoader.
     * @param {DataLoaderApi} dv Dataview or other API instance with pages() function
     * @param {InstanceType<typeof DataFilter.Instance>} filter
     * @param {DescriptorInstance} descriptor
     */
    create(dv, filter, descriptor) {
        return new DataLoader.Instance(dv, filter, descriptor);
    }
}
