module.exports = async (tp, raw = false) => 
{
    const values = [
        null,
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
    const value = await tp.system.suggester(labels, values);    
    if (!value) {
        return raw ? null : "";
    } else {
        return raw ? [value] : ("\n" + [value].map(v => `  - ${v}`).join("\n"));
    }
};
