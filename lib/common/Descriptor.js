/**
 * Enables conditional description output in Dataview scripts.
 * @class
 */

class Descriptor {

    static Instance = class {
        #dv;
        get dv() { return this.#dv; }
        constructor(dv) {
            this.#dv = dv;
        }
        clear() {}
        pushMethod(methodName) {}
        push(text, indentLevel) {}
        output() {}
    }

    static Full = class extends Descriptor.Instance {
        _dataArray = [];

        constructor(dv) {
            if (dv?.constructor?.name !== "DataviewInlineApi") {
                throw new Error(`DataviewInlineApi instance must be provided!`);
            }
            super(dv);
            this.clear();
        }

        clear() {
            this._dataArray = [];
            this._dataArray.push(" > **Explanation**");
        }

        pushMethod(methodName) {
            this.push(`\`${methodName}()\``, 0);
        }

        push(text, indentLevel = 1) {
            const indent = " ".repeat(indentLevel * 2);
            this._dataArray.push(`${indent}- ${text}`);
        }

        output() {
            if (this._dataArray.length > 0) {
                this.dv.paragraph(this._dataArray.join("\n > "));
            }
        }
    }

    // Factory method
    create(dv, enabled = false) {
        if (enabled) {
            return new Descriptor.Full(dv);
        } else {
            return new Descriptor.Instance(dv);
        }
    }
}
