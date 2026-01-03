// @ts-check

/**
 * @fileoverview Descriptor
 * @description Enables conditional description output in Dataview scripts.
 */

/**
 * @class Descriptor container class (customJS compatible)
 * @classdesc Contains Descrioptor implementations (one empty, one fully implemented).
 * @typedef {InstanceType<typeof Descriptor.Instance>} DescriptorInstance
 */
class Descriptor {

    /**
     * @class Empty Descriptor implementation
     * @classdesc Contains abstract Descriptor methods that do nothing.
     */
    static Instance = class Instance {
        /**
         * Gets the descriptor data as string array.
         * @returns {string[]}
         */
        get data() { return []; }

        /**
         * Gets the length of descriptor data.
         * @returns {number}
         */
        get dataLength() { return 0; }

        /**
         * Creates an instance of Descriptor. Clears the dataArray.
         */
        constructor() {
            this.clear();
        }

        /**
         * Clears the descriptor data.
         */
        clear() {}

        /**
         * Pushes a method description to the descriptor.
         * @param {string} methodName Method
         */
        pushMethod(methodName) {}

        /**
         * Pushes a text line to the descriptor with optional indentation.
         * @param {string} text
         * @param {number} indentLevel
         */
        push(text, indentLevel) {}
    }

    /**
     * @class Descriptor implementation
     * @classdesc Contains fully implemented Descriptor methods.
     */
    static InstanceImpl = class extends Descriptor.Instance {
        _dataArray = [];

        /**
         * Gets the descriptor data as string array.
         * @returns {string[]}
         */
        get data() { return this._dataArray; }

        /**
         * Gets the length of descriptor data.
         * @returns {number}
         */
        get dataLength() { return this._dataArray.length; }

        /**
         * Clears the descriptor data.
         */
        clear() {
            this._dataArray = [];
            this._dataArray.push(" > **Explanation**");
        }

        /**
         * Pushes a method description to the descriptor.
         * @param {string} methodName Method
         */
        pushMethod(methodName) {
            this.push(`\`${methodName}()\``, 0);
        }

        /**
         * Pushes a text line to the descriptor with optional indentation.
         * @param {string} text
         * @param {number} indentLevel
         */
        push(text, indentLevel = 1) {
            const indent = " ".repeat(indentLevel * 2);
            this._dataArray.push(`${indent}- ${text}`);
        }
    }

    /**
     * Creates an instance of Descriptor.
     * @param {boolean} [enabled=false] Enable full Descriptor functionality?
     * @returns {DescriptorInstance}
     */
    create(enabled = false) {
        if (enabled) {
            return new Descriptor.InstanceImpl();
        } else {
            return new Descriptor.Instance();
        }
    }
}
