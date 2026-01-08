// @ts-check

/**
 * @fileoverview Renderer class
 * @description  Outputs tables and paragraphs
 */

/**
 * @class
 * @classdesc
 * @typedef {InstanceType<typeof ViewRenderer.Instance>} ViewRendererInstance
 */

class ViewRenderer {

    static Instance = class {

        #dv
        /**
         * @returns {DataRendererApi}
         */
        get _dv() { return this.#dv; }
        #formatter
        /**
         * @returns {ViewFormatter}
         */
        get _formatter() { return this.#formatter; }

        /**
         * Creates an instance of ViewRenderer.
         * @param {DataRendererApi} dv
         * @param {ViewFormatter} formatter
         */
        constructor(dv, formatter) {
            if (!dv) {
                throw new Error("DataRendererApi required");
            }
            this.#dv = dv;
            if (!formatter) {
                throw new Error("ViewFormatters required");
            }
            this.#formatter = formatter;
        }

        /**
         * Creates a textblock using content of descriptor.
         * @param {DescriptorInstance} descriptor Descriptor instance
         */
        outputDescriptor(descriptor) {
            if (descriptor.dataLength > 0) {
                this._dv.paragraph(descriptor.data.join("\n > ")); // todo: fix > is not displayed in the first row
            }
        }

        /**
        * @private
        * Injects the required CSS directly into the document head.
        * This makes the script "Zero-Setup" (no external .css file needed).
        * ToDo: extract into a styler-class?
        */
        _ensureStyles() {
            const styleId = "finbase-injected-styles"; // todo: into finbaseConsts and styleclasses!
            let style = `
                /* Container */
                .fb-dynamic-container {
                    width: var(--fb-width, 100%);
                    display: block;
                    overflow-x: auto;
                    margin-block-end: 1rem;
                }
                /* Fill table to 100% inside the container */
                .fb-dynamic-container table {
                    width: 100% !important;
                    margin: 0 !important;
                    /* table-layout: fixed;  <-- same width for table */
                }
            `; // ToDo: const --fb-width & classes
            // ToDo: Optional: alignment
            // css = css + `
            //     .fb-dynamic-container.fb-numbers td { text-align: right; }
            //     .fb-dynamic-container.fb-numbers td:first-child { text-align: left; }
            //     .fb-dynamic-container.fb-numbers th { text-align: right; }
            //     .fb-dynamic-container.fb-numbers th:first-child { text-align: left; }
            // `;

            // Style element already there?
            let styleElement = document.getElementById(styleId);
            if (!styleElement) {
                styleElement = document.createElement("style");
                styleElement.id = styleId;
                document.head.appendChild(styleElement); // Send style-element to the browser
            }
            // Reload by setting styles if changed
            if (styleElement.textContent !== style) {
                styleElement.textContent = style;
            }
        }

        /**
         * Renders a flexible table based on a column definition.
         * @param {any[]} data - The data array (rows).
         * @param {TableDefinition} definition - The column configuration.
         * @param {string} [width="100%"] - CSS width (e.g. 100%, 20px, ...).
         */
        renderTable(data, definition, width = "100%") {
            if (!data || data.length === 0) {
                this._dv.paragraph("*No data*");
                return;
            }
            const headers = definition.map((col, i) => {
                let title = col.heading ?? col.key ?? "";
                if (i === 0) {
                    const style = 'font-weight: bold; font-size: 0.90em; color: var(--text-muted);';
                    const countBadge = `<span style="${style}">(${data.length})</span>`;
                    title += ` ${countBadge}`;
                }
                if (col.minWidth) {
                    // height: 0 & overflow: hidden -> no space below consumed
                    title += `<div style="width: ${col.minWidth}; height: 0px; overflow: hidden;"></div>`;
                }
                return title;
            });
            const rows = data.map(row => {
                return definition.map(col => {
                    const raw = col.key ? row[col.key] : undefined;
                    const formatFunc = (col.format || this._formatter.default).bind(this._formatter);
                    let displayVal = formatFunc(raw, row);
                    displayVal = (col.align) ? col.align.call(this._formatter, displayVal) : displayVal;
                    if (col.noWrap) { displayVal = this._formatter.nowrap(displayVal); }
                    return displayVal ?? null;
                });
            });
            // Ensure style-injection & styles
            if (width !== "100%") { this._ensureStyles(); }
            let classList = "fb-dynamic-container"; // Todo: Constant!
            let styleAttr = `style="--fb-width: ${width};"`; // ToDo: const --fb-width
            // Create a Markdown table & styled output
            const table = this._dv.markdownTable(headers, rows); // ToDo: use own md-table generator
            // double-newline to ensure rendering!
            const html = `<div class="${classList}" ${styleAttr}>\n\n${table}\n\n</div>`;
            //console.log(html);
            this._dv.paragraph(html);
        }
    }

    /**
     * Creates an instance of ViewRenderer.
     * @param {DataRendererApi} dv
     * @param {ViewFormatter} formatter
     */
    create(dv, formatter) {
        return new ViewRenderer.Instance(dv, formatter);
    }
}
