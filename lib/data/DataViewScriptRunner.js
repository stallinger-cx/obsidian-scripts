// @ts-check

/**
 * @fileoverview Scriptrunner class
 * @description  Executes dataview scripts with error handling, preparing and finishing execution
 */

class DataViewScriptRunner {

    /**
     * Executes before script execution tasks.
     * @param {ViewRendererInstance} renderer Renderer for output
     * @param {DescriptorInstance} descriptor Descriptor instance
     */
    _beforeScriptExecution(renderer, descriptor) {
        descriptor.clear();
    }

    /**
     * Executes after script execution tasks.
     * @param {ViewRendererInstance} renderer Renderer for output
     * @param {DescriptorInstance} descriptor Descriptor instance
     */
    _afterScriptExecution(renderer, descriptor) {
        renderer.outputDescriptor(descriptor);
    }

    /**
     * Executes the provided script body with error handling.
     * @param {ViewRendererInstance} renderer Renderer for output
     * @param {DescriptorInstance} descriptor Descriptor instance
     * @param {Function} scriptBody - async logic: async () => { ... }
     */
    async execute(renderer, descriptor, scriptBody) {
        this._beforeScriptExecution(renderer, descriptor);
        try {
            await scriptBody();
        }
        catch (e) {
            const msg = `⛔ CRITICAL ERROR: ${e.message}`;
            console.error(msg, e);
            descriptor.push(msg);
            if (e.stack) descriptor.push(e.stack, 1);
        } finally {
            this._afterScriptExecution(renderer, descriptor);
        }
    }
}
