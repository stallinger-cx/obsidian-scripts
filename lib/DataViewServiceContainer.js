// @ts-check

/**
 * @fileoverview DataView Service Container
 * @description  Generates all necessary service instances for Dataview operations.
 */

/**
 * @typedef {InstanceType<typeof DataViewServiceContainer.Instance>} DataViewServiceContainerInstance
 */

class DataViewServiceContainer {

    static Instance = class {

        _dv;
        get dv() { return this._dv; }
        _enableDescriptor;
        get enableDescriptor() { return this._enableDescriptor; }

        /**
         * Creates an instance of ViewRenderer.
         * @param {DataviewInlineApiInstance} dv
         * @param {boolean} [enableDescriptor=true] Logging via Descriptor on or off?
         */
        constructor(dv, enableDescriptor = true) {
            if (!dv) {
                throw new Error(`DataviewInlineApiInstance required!`);
            }
            this._dv = dv;
            this._enableDescriptor = enableDescriptor;
            this._instances = {};
        }

        get descriptor() {
            if (!this._instances.descriptor) {
                // ToDo: dv wirklich an Descriptor übergeben nur wegen output??
                this._instances.descriptor = customJS.Descriptor.create(this.enableDescriptor);
            }
            return this._instances.descriptor;
        }

        get dataFilter() {
            if (!this._instances.dataFilter) {
                this._instances.dataFilter = customJS.DataFilter.create(this.descriptor);
            }
            return this._instances.dataFilter;
        }

        get dataAggregator() {
            if (!this._instances.dataAggregator) {
                this._instances.dataAggregator = customJS.DataAggregator.create(this.descriptor);
            }
            return this._instances.dataAggregator;
        }

        get dataSorter() {
            if (!this._instances.dataSorter) {
                this._instances.dataSorter = customJS.DataSorter.create(this.descriptor);
            }
            return this._instances.dataSorter;
        }

        get dataLoader() {
            if (!this._instances.dataLoader) {
                this._instances.dataLoader = customJS.DataLoader.create(
                    this.dv,
                    this.dataFilter,
                    this.descriptor
                );
            }
            return this._instances.dataLoader;
        }

        get renderer() {
            if (!this._instances.renderer) {
                this._instances.renderer = customJS.ViewRenderer.create(this.dv);
            }
            return this._instances.renderer;
        }

        get formatters() {
            if (!this._instances.formatters) {
                this._instances.formatters = customJS.ViewFormatters;
            }
            return this._instances.formatters;
        }
    }

    /**
     * Creates an instance of ViewRenderer.
     * @param {DataviewInlineApiInstance} dv
     * @param {boolean} [enableDescriptor=true] Logging via Descriptor on or off?
     */
    create(dv, enableDescriptor = true) {
        return new DataViewServiceContainer.Instance(dv, enableDescriptor);
    }
}
