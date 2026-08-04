// scripts/moveToFolder.js
// ToDo: Race-Conditions (Umbenennung vor der Ausführung) noch verhindern: https://claude.ai/share/d69c298b-cf11-4829-ab8b-069b7cabcb23
async function moveToFolder(tp, folders, folderTexts) {
    if (!folderTexts) { folderTexts = folders; }
    // Filter existing
    const exists = (p) => !!app.vault.getAbstractFileByPath(p);
    const filtered = folders.reduce((acc, f, i) => {
        if (exists(f)) acc.push({ f, t: folderTexts[i] });
        return acc;
    }, []);
    if (!filtered.length) return;
    const chosen = await tp.system.suggester(
        filtered.map(x => x.t),
        filtered.map(x => x.f),
        false, "Target"
    );
    if (!chosen) return;
    const finalPath = `${chosen}/${tp.file.title}`;
    await tp.file.move(finalPath);
    // Kurz warten bis Obsidian den Move verarbeitet hat
    await new Promise(r => setTimeout(r, 100));
    app.commands.executeCommandById("workspace:edit-file-title");
}
module.exports = moveToFolder;
