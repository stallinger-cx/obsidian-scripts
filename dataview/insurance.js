/**
 * @fileoverview    Cost and sum where property 'cost_allocation' == current file-link.
 * @description
 */


const utils = customJS.Utils; // get singleton instance of Utils from customJS

// filterkey must be string.
//  could be, 'relates_to', 'cost_allocation', 'cost_invoice_group', 'vendor', etc.
//  it defaults to 'cost_allocation' if not set (for now)
const filterTag = input?.filterTag ?? 'finance/insurance';

// ToDo: erweitern f. generellen Cost-per-Month-View => siehe dort, Änderungen wieder einpflegen

// ToDo: in andere Utils-Klasse
function getFirstAccountId(costPaymentMethods) {
    for (const link of costPaymentMethods || []) {
        if (link.path !== undefined) {
            const account = dv.page(link.path);
            if (account.account_id) return account.account_id;
        };
    }
    return null;
}

// entries-array
let entries = dv
    .pages(`"notes" AND #${filterTag}`)
    // remove the overview note itself
    .where(p => p.file.name !== dv.current().file.name)
    // filter notes, with the cost_per property > 0.0
    // .where(p => {
    //     return ((p['cost']) && (typeof p['cost'] === 'number')
    //         && (p['cost_per']) && (typeof p['cost_per'] === 'number') && (p['cost_per'] > 0.0))
    // })
    .map(p => {
        const cost = ((p['cost']) && (typeof p['cost'] === 'number')) ? p['cost'] : null;
        const costPer = ((p['cost_per']) && (typeof p['cost_per'] === 'number')) ? p['cost_per'] : null;
        return {
            tags: p.file.frontmatter.tags ? p.file.frontmatter.tags : [],
            desc: p.file.link,
            brand: p.brand,
            updated: moment(p['updated'].toString()), // convert to moment object
            cost: cost,
            costPer: costPer,
            costPerMonth: (cost && costPer) ? (cost / costPer) : null,
            costPaymentAccountId: getFirstAccountId(p['cost_paymentmethods']),
            notes: p['notes'],
            owners: p['owners'],
            id: p['account_id'],
            status: p['status'],
            relates_to: p['relates_to']
        }
    })

    .array()
    .sort((a, b) => {
        return a.desc.path.localeCompare(b.desc.path); // a.tags.localeCompare(b.tags) ||
    });

// sum of cost per month
let sumPerMonth = entries
    .filter(p => p.costPerMonth > 0.0)
    .map(p => p.costPerMonth)
    .reduce((acc, val) => acc + val, 0.0);

dv.table(
    ["category", "description", "status", "brand", "pol", "owners", "relates_to", "~ cost p.m.", "account (curr)", "notes"],
    entries.map(e => [
        e.tags.sort().map(tag => '#' + tag),
        e.desc,
        e.status,
        e.brand,
        e.id,
        e.owners,
        e.relates_to,
        // e.updated.format('YYYY-MM-DD'),
        // e.cost.toFixed(2),
        // e.costPer,
        e.costPerMonth?.toFixed(2),
        e.costPaymentAccountId,
        e.notes
    ])
)

dv.paragraph(`💰 Sum per month: **${sumPerMonth.toFixed(2)} €**`);
