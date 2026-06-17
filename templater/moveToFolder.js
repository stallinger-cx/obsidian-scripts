// scripts/moveToFolder.js
async function moveToFolder(tp, folders) {
    const chosen = await tp.system.suggester(folders, folders, false, "Target");
    if (!chosen) return;

    const baseName = tp.file.title;
    let targetName = baseName;
    while (app.vault.getAbstractFileByPath(`${chosen}/${targetName}.md`)) {
        targetName = `${baseName}_${Date.now()}`;
    }
    const finalPath = `${chosen}/${targetName}`;
    await tp.file.move(finalPath);
    // Kurz warten bis Obsidian den Move verarbeitet hat
    await new Promise(r => setTimeout(r, 100));
    app.commands.executeCommandById("workspace:edit-file-title");
}
module.exports = moveToFolder;
