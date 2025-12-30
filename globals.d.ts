// @ts-check

/**
 * @fileoverview Global TypeDefs
 * @description  Global definitions for Obsidian and Dataview.
 */

/**
 * Additional table columns with description
 * ToDo: create real class!
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
declare const dv: any; // ToDo: DataviewInlineApi decl.
// Moment.js (always available in Obsidian)
declare const moment: any;
// CustomJS Container
declare const customJS: {
    [key: string]: any;
};
// Obsidian app object (if necessary)
//declare const app: any;
