const FRONTMATTER_ORDER = [
    "id",
    "scopes",
    "created",
    "updated",
    "updated_count",
    "viewed",
    "tags",
    "aliases",
    "organizations",
    "contexts",
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

const hasOwn = (object, key) =>
    Object.prototype.hasOwnProperty.call(object, key);

const replaceObjectContents = (target, source) => {
    for (const key of Object.keys(target)) delete target[key];
    Object.assign(target, source);
};

module.exports = (fm) =>
{
    const reordered = {};
    // Set order for known properties
    for (const key of FRONTMATTER_ORDER) {
        if (hasOwn(fm, key)) {
            reordered[key] = fm[key];
        }
    }
    // other properties at end
    for (const key of Object.keys(fm)) {
        if (hasOwn(reordered, key)) continue;
        reordered[key] = fm[key];
    }
    replaceObjectContents(fm, reordered);
};
