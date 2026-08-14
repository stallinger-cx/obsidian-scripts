module.exports = async (tp, additions = null, recreateDefaults = true) => 
{
    additions ??= {};

    const isEmpty = value =>
        value == null ||
        (typeof value === "string" && value.trim() === "");

    const isEmptyAddition = value =>
        isEmpty(value) ||
        (Array.isArray(value) &&
            value.every(item => isEmpty(item) || item === "[[]]"));

    const equals = (left, right) =>
        JSON.stringify(left) === JSON.stringify(right);

    const mergeValues = (currentValue, addition) => {
        if (currentValue == null || isEmptyAddition(addition)) {
            return currentValue ?? addition;
        }

        const currentValues = Array.isArray(currentValue) ? currentValue : [currentValue];
        const additionValues = Array.isArray(addition) ? addition : [addition];
        const mergedValues = [...currentValues];

        for (const value of additionValues) {
            if (!mergedValues.some(current => equals(current, value))) {
                mergedValues.push(value);
            }
        }

        return mergedValues.length === currentValues.length
            ? currentValue
            : mergedValues;
    };

    const defaultKeys = new Set(["id", "contexts", "created"]);

    const file = tp.config.target_file;
    const current = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const now = tp.date.now("YYYY-MM-DD[T]HH:mm:ssZ");

    const id = recreateDefaults || !current.id
        ? await tp.user.generateId()
        : current.id;
    const contexts = recreateDefaults || current.contexts == null
        ? await tp.user.askContextValue(tp, true)
        : current.contexts;
    const created = recreateDefaults || !current.created
        ? now
        : current.created;

    const structure = {
        id: id,
        contexts: contexts,
        created: created,
        updated: now,
        tags: current.tags ?? null,
        aliases: current.aliases ?? null,
        organizations: current.organizations ?? ["[[]]"],
        containers: current.containers ?? ["[[]]"],
        "is-reference": true // if it is run through handleFm.js, it is 'redefined'
    };
    // Merge non-empty additions; empty placeholders only create missing properties.
    for (const [key, value] of Object.entries(additions)) {
        if (defaultKeys.has(key)) continue;
        structure[key] = mergeValues(current[key], value);
    }
    await app.fileManager.processFrontMatter(file, fm => 
    {
        // Get current properties
        for (const key of Object.keys(fm)) {
            if (key in structure) continue;
            structure[key] = fm[key];
        }
        // Set frontmatter
        Object.keys(fm).forEach(key => delete fm[key]);
        Object.assign(fm, structure);
        // Ensure property order
        tp.user.ensureFmPropertyOrder(fm);        
    });
};
