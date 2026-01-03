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
         * Renders a flexible table based on a column definition.
         * @param {any[]} data - The data array (rows).
         * @param {TableDefinition} columns - The column configuration.
         */
        renderTable(data, columns) {
            if (!data || data.length === 0) {
                this._dv.paragraph("*No data*");
                return;
            }
            const headers = columns.map(col => {
                // Der Nullish Coalescing Operator (??) ist hier perfekt.
                // Er nimmt den rechten Wert nur, wenn der linke null oder undefined ist.
                return col.heading ?? col.key ?? "";
            });
            const rows = data.map(row => {
                return columns.map(col => {
                    let val = col.key ? row[col.key] : undefined;
                    if (col.formatter) {
                        val = col.formatter(val, row);
                    }
                    return val ?? "";
                });
            });
            this._dv.table(headers, rows);
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
