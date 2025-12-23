/**
 * @fileoverview    Displays cars by owner
 * @description
 */

const utils = customJS.Utils; // get singleton instance of Utils from customJS

const owner = input?.owner?.toLowerCase() ?? null;
const owner_excluded = input?.owner_excluded ?? false;

const pages = dv.pages('"notes" AND #mobility/car')
    .filter(p => {
        // Exclude 'this' file
        if (p.file.path === dv.current().file.path) return false;
        // Exclude pages with tags starting with "mobility/car//"
        if ((Array.isArray(p.tags) && p.tags.some(t => String(t).startsWith("mobility/car/")))
            || (typeof p.tags === "string" && p.tags.startsWith("mobility/car/"))) return false;
        // Owner filtering
        const filtered = utils.stringifyLinks(p.owners).toLowerCase().includes(owner);
        return owner_excluded ? !filtered : filtered;
    })
    .map(d => {
        // calculate total cost of ownership (tco)
        d.depreciableBase = ((d.cost ?? 0) - (d.cost_income ?? 0));
        d.tco = d.depreciableBase; // ToDo: add other costs related to this car (see cost_allocation views)! started wäre dann frühestes cost_date und falls es kein expired gibt, das letzte cost_date das ende!
        // calculate usage months
        if (d.cost_date) {
            const start = d.cost_date;
            const end = d.expired ?? dv.date('today');
            d.usage_months = Math.floor(end.diff(start, "months").months);
        } else {
            d.usage_months = null;
        }
        // calculate straight-line monthly depreciation
        if ((d.tco > 0) && d.usage_months) {
            d.sld = d.tco / d.usage_months;
        } else {
            d.sld = null;
        }
        // ToDo: Berechnungsmethoden in separate utils auslagern!
        return d;
    })
    .array() // convert to array because the dataview-object's sort function is limited
    .sort(
        (a, b) => {
            // Sort by status ascending
            if (a.status < b.status) return -1;
            if (a.status > b.status) return 1;
            // Sort by started descending
            if (a.started > b.started) return -1;
            if (a.started < b.started) return 1;
            return 0;
        }
    );

dv.table(
    ["car", "brand", "type", "notes", "status", "from", "to", "owners", 'ulm', "tco", "sld"],
    pages.map(p => [
        p.file.link,
        p.brand,
        p.type,
        p.notes,
        p.status,
        p.started,
        p.expired,
        p.owners,
        p.usage_months,
        p.tco?.toFixed(2),
        p.sld?.toFixed(2)
    ])
);
