// @ts-check

/**
 * @fileoverview DataLoader class
 * @description  Loads relevant data pages from Dataview.
 */

/**
 * @typedef {InstanceType<typeof DataLoader.Instance>} DataLoaderInstance
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
         * @returns {Record<string, any>[]} - data pages (array of entry-objects)
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
         * @param {(string|{path: string})[]} filterValues - string or Obsidian link (object with 'path' property).
         * @returns {Record<string, any>[]} - data pages (array of entry-objects)
         */
        getNotesFiltered(folder, tags, filterKeys, filterValues)
        {
            let baseFilterString = this._generateBaseFilterString(folder, tags);
            let entries = this._dv.pages(`${baseFilterString}`).array();

            this._descriptor.pushMethod("getNotesFiltered");
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
