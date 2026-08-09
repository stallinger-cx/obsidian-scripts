module.exports = async (tp, additions = {}) => 
{
    const file = tp.config.target_file;
    const current = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const now = tp.date.now("YYYY-MM-DD[T]HH:mm:ssZ");
    const structure = {
        id: await tp.user.generateId(),
        sync: await tp.user.askSyncValue(tp, true),
        created: now,
        updated: now,
        tags: current.tags ?? null,
        aliases: current.aliases ?? null,
        relates_to: current.relates_to ?? "[[]]",
        organizations: current.organizations ?? "[[]]",
        ...additions
    };
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
