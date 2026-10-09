module.exports = async (tp, property, roles = []) => 
{
    const file = tp.config.target_file ?? app.workspace.getActiveFile();
    if (!file || file.extension !== "md") {
        throw new Error("No Markdown note selected");
    }
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
        if (fm[property] == null) {
            fm[property] = [];
        } else if (!Array.isArray(fm[property])) {
            throw new Error(`${property} must be an array`);
        }
        fm[property].push({
            target: "[[]]",
            role: finalRole
        });
        tp.user.ensureFmPropertyOrder(fm);
    });
};
