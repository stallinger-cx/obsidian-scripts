// @ts-check

/**
 * @fileoverview Global TypeDefs
 * @description  Global definitions for Obsidian and Dataview.
 */

// Imports (aliased!!)
//  Redefining the internal name, to get the correct names globally!
import { DataviewInlineApi as _DataviewInlineApi } from "obsidian-dataview";
import * as _moment from "moment";

/**
 * DataLoader API interface (part of DataviewInlineApi)
 * @see .dev\node_modules\obsidian-dataview\lib\api\inline-api.d.ts for details
 */
interface _DataLoaderApi {
    pages(query?: string): DataArray<any>;
}

/**
 * DataRenderer API interface (part of DataviewInlineApi)
 * @see .dev\node_modules\obsidian-dataview\lib\api\inline-api.d.ts for details
 */
interface _DataRendererApi {
    header(level: number, text: any, options?: DomElementInfo): HTMLHeadingElement;
    paragraph(text: any, options?: DomElementInfo): HTMLParagraphElement;
    span(text: any, options?: DomElementInfo): HTMLSpanElement;
    view(viewName: string, input: any): Promise<void>;
    list(values?: any[] | DataArray<any>): Promise<void>;
    table(headers: string[], values?: any[][] | DataArray<any>): Promise<void>;
}

/**
 * Defines for table column formatting
 */
type CellFormatter = (value: any, row?: any) => any;

/**
 * Defines a table column (v2)
 */
interface TableColumnConfig {
    /**
     * Key name or property name of the object passed to the renderer (e.g. "cost", "cost_date", ...).
     */
    key: string;
    /**
     * Column Heading (defaults to 'key' if not specified)
     */
    heading?: string;
    /**
     * Fomatter to format values.
     */
    formatter?: CellFormatter;
}

declare global {

    // JSDoc for globally visible types
    type DataviewInlineApiInstance = _DataviewInlineApi;
    type DataLoaderApi = _DataLoaderApi;
    type DataRendererApi = _DataRendererApi;

    /**
     * Table definition type (array of column definitions)
     */
    type TableDefinition = TableColumnConfig[];

    /**
     * @deprecated // todo: my tablecolumn-Def ... to be replaced by TableColumnConfig
     */
    interface TableColumns {
        /**
         * - key: column specification
         * - value: description
         */
        [key: string]: any;
    }

    // global variables (available apis)
    const customJS: any;
    const dv: DataviewInlineApiInstance;
    const moment: typeof _moment; // Trick: merge function with namespace
    const input: any;
//    const app: any;
}

// Macht die Datei zum Modul
export {};
