/**
 * Class representing a point.
 * @class
 */

class DataViewServiceContainer {

    static Instance = class {

        _dv;
        get dv() { return this._dv; }
        _enableLogging;
        get enableLogging() { return this._enableLogging; }

        constructor(dv, enableLogging = true) {
            if (dv?.constructor?.name !== "DataviewInlineApi") {
                throw new Error(`DataviewInlineApi instance must be provided!`);
            }
            this._dv = dv;
            this._enableLogging = enableLogging;
            this._instances = {};
        }

        get descriptor() {
            if (!this._instances.descriptor) {
                // ToDo: dv wirklich an Descriptor übergeben nur wegen output??
                this._instances.descriptor = customJS.Descriptor.create(this.dv, this.enableLogging);
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
    }

    create(dv, enableLogging = true) {
        return new DataViewServiceContainer.Instance(dv, enableLogging);
    }
}
