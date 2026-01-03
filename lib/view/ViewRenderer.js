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
    }

    /**
     * Creates an instance of ViewRenderer.
     * @param {DataRendererApi} dv
     */
    create(dv) {
        return new ViewRenderer.Instance(dv);
    }
}
