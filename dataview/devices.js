/**
 * @fileoverview    Displays network devices by 'uplink' (new via `relates_to`)
 * @description
 */

// load
const currentPath = dv.current().file.path;
const data = dv
    .pages('"notes" AND #computing/device')
    .where(p => {
         // WHERE contains(relates_to, this.file.link)
         const relations = [].concat(p.relates_to || []);
         return relations.some(link => (link && (link.path === currentPath)));
    })
    .array()
    .sort((a, b) => {
        return (
            (a.order || 0) - (b.order || 0) ||
            String(a.tags).localeCompare(String(b.tags)) ||
            a.file.name.localeCompare(b.file.name)
        );
    });

// view
dv.table(
    ["device", "aliases", "order", "tags", "status", "notes"],
    data.map(p => [p.file.link, p.aliases, p.order, p.tags, p.status, p.notes])
);
