module.exports = async (tp, raw = false) => 
{
    const values = [
        null,
        "xDMZ",
        "aureka",
        "stallinger-cx",
        "stallinger-dev",
        "limis",
        "staged",
        "bmd"
    ];
    const labels = [
        "-",
        "xDMZ",
        "Aureka Systems",
        "Stallinger-cX",
        "Stallinger-DEV",
        "LiMiS",
        "StaGeD",
        "BMD GmbH"
    ];
    const value = await tp.system.suggester(labels, values);    
    if (!value) {
        return raw ? null : "";
    } else {
        return raw ? [value] : ("\n" + [value].map(v => `  - ${v}`).join("\n"));
    }
};
