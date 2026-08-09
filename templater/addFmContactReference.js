module.exports = async (tp, property, roles = []) => 
{
    const file = app.workspace.getActiveFile();
    const role = await tp.system.suggester(
        [...roles, "Other..."],
        [...roles, "__custom__"],
        false,
        "Choose a role"
    );
    if (!role) return;
    let finalRole = role;
    if (role === "__custom__") {
        finalRole = await tp.system.prompt("Enter role name");
        if (!finalRole) return;
    }
    await app.fileManager.processFrontMatter(file, fm => {
        if (!Array.isArray(fm[property])) {
            fm[property] = [];
        }
        fm[property].push({
            role: finalRole,
            target: "[[]]"
        });
        tp.user.ensureFmPropertyOrder(fm);
    });
};
