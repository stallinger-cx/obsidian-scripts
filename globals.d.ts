// @ts-check

/**
 * @fileoverview FinBase-TypeDefs
 * @description  Global definitions for Obsidian and Dataview.
 */

/**
 * DataFilter object for DataLoader
 */
interface FilterParams {
    /**
     * Optional filterTags (e.g. ['#finance', '#finance/asset']).
     * Will internally be OR'ed.
     */
    tags?: string[];

    /**
     * Key-value-object for filtering.
     * - key must be a string.
     * - value must be string or Obsidian link (object with 'path' property).
     * e.g.: `{ relates_to: dv.current().file.link, status: 'active' }`.
     */
    [key: string]: any;
}


/**
 * Additional table columns with description
 */
interface TableColumns {
    /**
     * - key: column specification
     * - value: description
     * e.g.: `{ relates_to: 'related documents' }`.
     */
    [key: string]: any;
}

// Dataview API
declare const dv: any;
// Moment.js (always available in Obsidian)
declare const moment: any;
// CustomJS Container
declare const customJS: {
    [key: string]: any;
};
// Obsidian app object (if necessary)
declare const app: any;
