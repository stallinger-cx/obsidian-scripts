class DataViewScriptRunner {

    /**
     * @param {Object} descriptor - Descriptor instance
     * @param {Function} scriptBody - async logic: async () => { ... }
     */
    async execute(descriptor, scriptBody) {
        try {
            await scriptBody();
        }
        catch (e) {
            const msg = `⛔ CRITICAL ERROR: ${e.message}`;
            console.error(msg, e);
            descriptor.push(msg);
            if (e.stack) descriptor.push(e.stack, 1);
        } finally {
            descriptor.output();
        }
    }
}
