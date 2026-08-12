module.exports = async (tp, additions = {}, recreateDefaults = true) => 
{
    const file = tp.config.target_file;
    const current = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const now = tp.date.now("YYYY-MM-DD[T]HH:mm:ssZ");

    const id = recreateDefaults || !current.id
        ? await tp.user.generateId()
        : current.id;
    const vaults = recreateDefaults || current.vaults == null
        ? await tp.user.askSyncValue(tp, true)
        : current.vaults;
    const created = recreateDefaults || !current.created
        ? now
        : current.created;

    const structure = {
        id: id,
        vaults: vaults,
        created: created,
        updated: now,
        tags: current.tags ?? null,
        aliases: current.aliases ?? null,
        organizations: current.organizations ?? ["[[]]"],
        containers: current.containers ?? ["[[]]"],
        "is-reference": true // if it is run through handleFm.js, it is 'redefined'
    };
    // Append additions only, if value doesn't exist!!
    for (const [key, value] of Object.entries(additions)) {
        structure[key] = current[key] ?? value;
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
