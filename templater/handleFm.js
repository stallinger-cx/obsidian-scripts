const DEFAULT_KEYS = new Set(["id", "scopes", "created", "updated"]);

const hasOwn = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

const isEmpty = value =>
    value == null ||
    (typeof value === "string" && value.trim() === "");

const isEmptyAddition = value =>
    isEmpty(value) ||
    (Array.isArray(value) &&
        value.every(item => isEmpty(item) || item === "[[]]"));

const equals = (left, right) =>
    JSON.stringify(left) === JSON.stringify(right);

// Preserve the existing append semantics for scalars, arrays and objects.
const mergeFrontmatterValues = (currentValue, addition) => {
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

const replaceObjectContents = (target, source) => {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, source);
};

module.exports = async (tp, additions = null, recreateDefaults = true) =>
{
    additions ??= {};

    const file = tp.config.target_file;
    const current = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const now = tp.date.now("YYYY-MM-DD[T]HH:mm:ssZ");

    const id = recreateDefaults || !current.id
        ? await tp.user.generateId()
        : current.id;
    const scopes = recreateDefaults || current.scopes == null
        ? await tp.user.askContextValue(tp, true)
        : current.scopes;
    const created = recreateDefaults || !current.created
        ? now
        : current.created;

    const nextFrontmatter = {
        id,
        scopes,
        created,
        updated: now,
        tags: current.tags ?? null,
        aliases: current.aliases ?? null,
        organizations: current.organizations ?? ["[[]]"],
        contexts: current.contexts ?? ["[[]]"],
        "is-reference": true // if it is run through handleFm.js, it is 'redefined'
    };
    // Merge non-empty additions; empty placeholders only create missing properties.
    for (const [key, value] of Object.entries(additions)) {
        if (DEFAULT_KEYS.has(key)) continue;
        nextFrontmatter[key] = mergeFrontmatterValues(current[key], value);
    }
    await app.fileManager.processFrontMatter(file, fm =>
    {
        // Get current properties
        for (const key of Object.keys(fm)) {
            if (hasOwn(nextFrontmatter, key)) continue;
            nextFrontmatter[key] = fm[key];
        }
        // Set frontmatter
        replaceObjectContents(fm, nextFrontmatter);
        // Ensure property order
        tp.user.ensureFmPropertyOrder(fm);
    });
};
