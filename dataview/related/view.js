// ToDo: use lib!
const currentPath = dv.current().file.path;
// Parse input options safely
const excludeCost = input && input.excludeCost === true;
const filterTag = input && input.filterTag; // e.g., "business/projects"
// Build the native query string dynamically for better performance
let queryString = '"notes"';
if (filterTag) {
    // Ensure the tag has a '#' prefix, regardless of how it was passed
    const safeTag = filterTag.startsWith('#') ? filterTag : '#' + filterTag;
    queryString += ` AND ${safeTag}`;
}
// 1. Load data using the dynamic query and filter remaining logic
const relatedPages = dv.pages(queryString)
    .where(p => {
        if (!p.relates_to) return false;
        if (excludeCost && (p.cost !== undefined)) return false;
        const relations = Array.isArray(p.relates_to) ? p.relates_to : [p.relates_to];
        return relations.some(link => link.path === currentPath);
    });
// 2. Multi-level cascade sort: order -> status -> tags -> filename
const sortedPages = relatedPages.array().sort((a, b) => {
    // Level 1: Order (Numeric, default to 0 if undefined)
    const orderA = Number(a.order) || 0;
    const orderB = Number(b.order) || 0;
    if (orderA !== orderB) {
        return orderA - orderB;
    }
    // Level 2: Status (Alphabetical)
    const statusA = String(a.status || "").toLowerCase();
    const statusB = String(b.status || "").toLowerCase();
    const statusCompare = statusA.localeCompare(statusB);
    if (statusCompare !== 0) {
        return statusCompare;
    }
    // Level 3: Tags (Safely cast arrays to strings for alphabetical comparison)
    const tagsA = String(a.tags || "").toLowerCase();
    const tagsB = String(b.tags || "").toLowerCase();
    const tagsCompare = tagsA.localeCompare(tagsB);
    if (tagsCompare !== 0) {
        return tagsCompare;
    }
    // Level 4: Filename (Alphabetical fallback)
    const nameA = String(a.file.name || "").toLowerCase();
    const nameB = String(b.file.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
});
// 3. Map to table rows
const tableData = sortedPages.map(p => {
    const isPrivate = p.file.folder.startsWith("notes/private") ? "🔒" : "";
    return [
        p.file.link,
        p.aliases,
        p.tags,
        p.relates_to,
        p.status,
        p.owners,
        p.emails,
        p.notes,
        isPrivate
    ];
});
// 4. Render
if (tableData.length > 0) {
    let info = '';
    if (excludeCost) {
        info += '- `Excluding cost notes`\n';
    }
    if (filterTag) {
        info += `- Filtered by: \`${filterTag}\``;
    }
    if (info) { dv.paragraph(info); }
    dv.table(["note", "aliases", "tags", "relates_to", "status", "owners", "emails", "notes", "privacy"], tableData);
}
