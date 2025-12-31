// @ts-check

/**
 * @fileoverview Param objects for the Data namespace.
 * @description  Manages filters required for loading and filtering notes by folder, tags and properties.
 */

/**
 * @class DataParams
 * @classdesc Central container and factory for data parameters.
 *
 * This class acts as a namespace to maintain a clean global scope.
 * It provides static methods and inner classes to instantiate standardized,
 * type-safe configuration objects for data queries (e.g., Dataview).
 */
class DataParams {

    /**
     * @class FilterContext
     * @classdesc Encapsulates filter data for folders, tags, and properties (key/value).
     *
     * This class serves as an intelligent data container:
     * - **Normalization:** Automatically converts single strings into arrays.
     * - **Integrity:** Prevents duplicates by internally utilizing Sets.
     * - **Flexibility:** Supports method chaining (Fluent Interface) and context merging.
     * * Primary purpose: To sanitize raw input data into a clean format for query engines.
     */
    static FilterContext = class FilterContext {

        /**
         * Creates a new filter context.
         * @param {Object} config - Advanced filter configuration.
         * @param {string|string[]} config.folders - Folders (e.g. "notes" or ["logs", "archives"]). Required.
         * @param {string|string[]} [config.tags] - Tags (e.g. ['#finance']).
         * @param {Record<string, string|{path: string}>} [config.filters] - Key-value filters (e.g. { relates_to: linkObj, status: 'active' }).
         */
        constructor({ folders, tags = [], filters = {} }) {
            if (!folders || (Array.isArray(folders) && (folders.length === 0))) {
                throw new Error('folders argument is required!');
            }
            // avoid duplicates by using sets
            this._folders = new Set(this._toArray(folders));
            this._tags = new Set(this._toArray(tags));
            // create a copy of the filter object (!)
            this._filters = { ...filters };
            // cleanup tags (if tags have been passed via filters)
            this._moveTagsFromFilterObject();
        }

        /**
         * Helper: Converts value to array (or empty array if null/undefined).
         * @param {any} val
         * @returns {Array}
         */
        _toArray(val) {
            if (val === null || val === undefined) return [];
            return Array.isArray(val) ? val : [val];
        }

        /**
         * Helper: Extracts 'tags' from the filter-object and adds it to the tags-Set.
         * Removes 'tags' from _filters afterwards to keep states clean.
         */
        _moveTagsFromFilterObject() {
            const val = this._filters.tags;
            if (val && (typeof val === 'string' || Array.isArray(val))) {
                this.addTags(val);
                delete this._filters.tags;
            }
        }

        /**
         * Adds one or more folders.
         * @param {string|string[]} folders - Folders to add.
         * @returns {this}
         */
        addFolders(folders) {
            const folderArray = this._toArray(folders);
            folderArray.forEach(d => this._folders.add(d));
            return this; // allows chaining: filter.addFolders('x').addTag('y')
        }

        /**
         * Adds tags.
         * @param {string|string[]} tags - Tags to add.
         * @returns {this}
         */
        addTags(tags) {
            const tagsArray = this._toArray(tags);
            tagsArray.forEach(t => this._tags.add(t));
            return this;
        }

        /**
         * Adds or replaces a single property-filter.
         * Special handling: If key is 'tags', it appends to the tags Set instead.
         * @param {string} key - Property name.
         * @param {string|{path: string}} value - string or Obsidian link (object with 'path' property).
         * @returns {this}
         */
        addFilter(key, value) {
            const c = customJS.Constants;
            if ((key === c.PROPERTY.TAGS) && (typeof value === 'string')) {
                this.addTags(value);
            } else {
                this._filters[key] = value;
            }
            return this;
        }

        /**
         * Adds or replaces multiple property-filters by array.
         * @deprecated Use the object-based overload addFilters({ key: value }) instead.
         * @param {string|string[]} filterKeys - property names
         * @param {(string|{path: string})[]} filterValues - string or Obsidian link (object with 'path' property).
         * @returns {this}
         */
        addFilters(filterKeys, filterValues) {
            const safeKeys = this._toArray(filterKeys);
            const safeValues = this._toArray(filterValues);
            safeKeys.forEach((key, index) => {
                const value = safeValues[index] !== undefined ? safeValues[index] : null;
                this.addFilter(key, value);
            });
            return this;
        }

        /**
         * Merges another FilterContext instance into this one.
         * @param {FilterContext} filterContext - The instance to merge.
         * @returns {this}
         */
        merge(filterContext) {
            if (!(filterContext instanceof DataParams.FilterContext)) {
                return this;
            }
            const source = filterContext.toObject();
            if (source.folders) this.addFolders(source.folders);
            if (source.tags) this.addTags(source.tags);
            if (source.filters) {
                Object.entries(source.filters).forEach(([k, v]) => this.addFilter(k, v));
            }
            return this;
        }

        get folders() {
            return Array.from(this._folders);
        }

        /**
         * @deprecated Only for backward compatibility.
         */
        get firstFolder() {
            return this.folders[0];
        }

        get tags() {
            return Array.from(this._tags);
        }

        get filterKeys() {
            return Object.keys(this._filters);
        }

        get filterValues() {
            return Object.values(this._filters);
        }

        /**
         * Returns this object's properties as a plain object.
         * @returns {{ folders: string|string[], tags: string[], filters: Object.<string, *> }} - configuration object
        */
        toObject() {
            return {
                folders: this.folders,
                tags: this.tags,
                filters: { ...this._filters }
            };
        }
    }

    /**
     * Factory method to create a new filter context.
     * @param {Object} config - Advanced filter configuration.
     * @param {string|string[]} config.folders - Folders (Required).
     * @param {string|string[]} [config.tags] - Tags.
     * @param {Record<string, string|{path: string}>} [config.filters] - Key-value filters (e.g. { relates_to: linkObj, status: 'active' }).
    * @returns {InstanceType<typeof DataParams.FilterContext>}
     */
    createFilterContext({ folders, tags = [], filters = {} }) {
        return new DataParams.FilterContext({folders, tags, filters});
    }

    /**
     * Adds or replaces multiple property-filters by array.
     * @deprecated Use the object-based overload addFilters({ key: value }) instead.
     * @param {string|string[]} folders - Folders (Required).
     * @param {string|string[]} [tags] - tags.
     * @param {string|string[]} [filterKeys] - property names.
     * @param {(string|{path: string})[]} [filterValues] - string or Obsidian link (object with 'path' property).
     * @returns {InstanceType<typeof DataParams.FilterContext>}
     */
    createFilterContextCompat(folders, tags = [], filterKeys = [], filterValues = []) {
        const filter = this.createFilterContext({ folders: folders });
        filter.addTags(tags);
        filter.addFilters(filterKeys, filterValues);
        return filter;
    }
}
