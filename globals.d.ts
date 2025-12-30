// @ts-check

/**
 * @fileoverview Global TypeDefs
 * @description  Global definitions for Obsidian and Dataview.
 */

// Imports (aliased!!)
//  Redefining the internal name, to get the correct names globally!
import { DataviewApi as _DataviewApi } from "obsidian-dataview";
import * as _moment from "moment";

declare global {

    // JSDoc for globally visible types
    type DataviewApi = _DataviewApi;
    const moment: typeof _moment; // Trick: merge function with namespace

    // todo: my tablecolumn-Def ... to be removed
    interface TableColumns {
        /**
         * - key: column specification
         * - value: description
         */
        [key: string]: any;
    }

    // global variables
    const customJS: any;
    const dv: DataviewApi;
    const input: any;
//    const app: any;
}

// Macht die Datei zum Modul
export {};
