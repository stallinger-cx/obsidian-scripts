module.exports = async (tp) => 
{
    const values = [
        "",
        "aureka",
        "stallinger-cx",
        "stallinger-dev",
        "limis",
        "staged"
    ];
    const labels = [
        "-",
        "Aureka Systems",
        "Stallinger-cX",
        "Stallinger-DEV",
        "LiMiS",
        "StaGeD"
    ];
    const sync = await tp.system.suggester(labels, values);
    const nanoId = await tp.user.generateId();
    let yaml = `id: ${nanoId}\n`;
        yaml += `sync: ${sync}\n`;
    return yaml;
};
