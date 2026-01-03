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

declare global {

    // JSDoc for globally visible types
    type DataviewInlineApiInstance = _DataviewInlineApi;
    type DataLoaderApi = _DataLoaderApi;
    type DataRendererApi = _DataRendererApi;

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
    const dv: DataviewInlineApiInstance;
    const moment: typeof _moment; // Trick: merge function with namespace
    const input: any;
//    const app: any;
}

// Macht die Datei zum Modul
export {};
