module.exports = (fm) => 
{
    const order = [
        "id",
        "contexts",
        "created",
        "updated",
        "tags",
        "aliases",
        "organizations",
        "scopes",
        "tenants",
        "domains",
        "emails",
        "phones",
        "addresses",
        "logins",
        "connections",
        "owners",
        "usernames",
        "dns",
        "started",
        "status",
        "asset",
        "finance",
        "see",
        "is-reference" // everything below this are unsorted/old/unmanaged properties
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
