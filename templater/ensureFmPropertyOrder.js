module.exports = (fm) => 
{
    const order = [
        "id",
        "vaults",
        "created",
        "updated",
        "tags",
        "aliases",
        "organizations",
        "containers",
        "tenants",
        "domains",
        "emails",
        "phones",
        "addresses",
        "logins",
        "connections",
        "owners",
        "usernames",
        "domains",
        "started",
        "status",
        "finance",
        "is-reference"
    ];
    const reordered = {};
    // Set order for known properties
    for (const key of order) {
        if (key in fm) {
            reordered[key] = fm[key];
        }
    }
    // other properties at end
    for (const key of Object.keys(fm)) {
        if (key in reordered) continue;
        reordered[key] = fm[key];
    }
    Object.keys(fm).forEach(key => delete fm[key]);
    Object.assign(fm, reordered);
};
