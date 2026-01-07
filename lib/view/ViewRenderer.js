// @ts-check

/**
 * @fileoverview Renderer class
 * @description  Outputs tables and paragraphs
 */

/**
 * @typedef {InstanceType<typeof ViewRenderer.Instance>} ViewRendererInstance
 */

class ViewRenderer {

    // ToDo: Extract renderer for dv-agnostic view
    // todo: table settings instead of interface TableColumns {}

    static Instance = class {

        #dv
        get _dv() { return this.#dv; }

        /**
         * Creates an instance of ViewRenderer.
         * @param {DataRendererApi} dv
         */
        constructor(dv) {
            if (!dv) {
                throw new Error("DataRendererApi required");
            }
            this.#dv = dv;
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
         * @param {TableDefinition} columns - The column configuration.
         * @param {string} [width="100%"] - CSS width (e.g. 100%, 20px, ...).
         */
        renderTable(data, columns, width = "100%") {
            if (!data || data.length === 0) {
                this._dv.paragraph("*No data*");
                return;
            }
            const headers = columns.map(col => {
                return col.heading ?? col.key ?? "";
            });
            const rows = data.map(row => {
                return columns.map(col => {
                    let val = col.key ? row[col.key] : undefined;
                    if (col.formatter) val = col.formatter(val, row);
                    // Important: Escape pipe characters to prevent breaking the table format in markdown!
                    const safeVal = (val ?? "").toString().replace(/\|/g, "\\|");
                    return safeVal;
                });
            });
            // Ensure style-injection & styles
            if (width !== "100%") { this._ensureStyles(); }
            let classList = "fb-dynamic-container"; // Todo: Constant!
            let styleAttr = `style="--fb-width: ${width};"`; // ToDo: const --fb-width
            // Create a Markdown table & styled output
            const mdTable = this._dv.markdownTable(headers, rows);
            // double-newline to ensure rendering!
            const html = `<div class="${classList}" ${styleAttr}>\n\n${mdTable}\n\n</div>`;
            this._dv.paragraph(html);
        }
    }

    /**
     * Creates an instance of ViewRenderer.
     * @param {DataRendererApi} dv
     */
    create(dv) {
        return new ViewRenderer.Instance(dv);
    }
}
