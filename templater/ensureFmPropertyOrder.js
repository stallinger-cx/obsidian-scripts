module.exports = (fm) => 
{
    const order = [
        "id",
        "sync",
        "created",
        "updated",
        "tags",
        "aliases",
        "relates_to",
        "organizations",
        "owners",
        "usernames",
        "paymentmethods",
        "emails",
        "phones",
        "addresses",
        "logins",
        "connected_to",
        "domain",
        "mailserver",
        "started",
        "status"
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
