/**
 * @fileoverview    Cost and sum where property 'cost_allocation' == current file-link.
 * @description
 */

const descriptor = customJS.Descriptor.create(dv, true /*enabled*/);
const dataFilter = customJS.DataFilter.create(descriptor);
const dataLoader = customJS.DataLoader.create(dv, dataFilter, descriptor);
const dataAggregator = customJS.DataAggregator.create(descriptor);
const consts = customJS.FinBaseConstants;

// ToDo: vielleicht könnte man die Keys gleich direkt aus dv.current().frontmatter holen!?
// ToDo: Code, der [[file|ALIASES]] entfernt... =>  .map(entry => entry.replace(/\[\[|\]\]/g, '').split('|')[0]) \

// filterkey must be string.
//  could be, 'relates_to', 'cost_invoice_group', etc.
//  it defaults to 'relates_to' if not set (for now)
const filterKey = input?.filterKey ?? 'relates_to';
// filterValue must be string or Obsidian link (object with 'path' property)
//  if not set, it defaults to the current file link
const filterValue = input?.filterValue ?? dv.current().file.link;
const filterTags = input?.filterTags;

// Additiona fields
const addProperties = Array.isArray(input?.addProperties) ? input?.addProperties : input?.addProperties ? [input?.addProperties] : ['vendor', 'cost_documents'];
let addPropertyNames = Array.isArray(input?.addPropertyNames) ? input?.addPropertyNames : input?.addPropertyNames ? [input?.addPropertyNames] : addProperties;
if (addProperties.length > addPropertyNames.length) {
    // fill up with property names
    addPropertyNames = addPropertyNames.concat(addProperties.slice(addPropertyNames.length));
}
// Negate cost (for transactions-view)
let negateCost = input?.negateCost ?? false;
// Worth-Calculations
let worthComparison = input?.worthComparison ?? false; // todo: worth-vergleich........

// todo: weitere Option: vergleich mit einer dv.current()-eigenschaft! siehe auch oben!
// T2

// load data filtered
let entries = dataLoader.getNotesFiltered(
        consts.DATADIR_NOTES,
        filterTags, // no tags here
        filterKey,
        filterValue
    );
// filter cost-entries: only those with `cost` or `cost_income` defined, and no `cost_per` defined
entries = dataFilter.filterCostRelatedEntries(entries, descriptor);
// map only relevant properties, convert cost_date to moment object
entries = entries
    .map(p => {
        //console.log(p['cost_date'].constructor.name);
        //dv.paragraph(p['cost_date'].constructor.name);
        let costWithIncome = (p['cost'] ?? 0) - (p['cost_income'] ?? 0); // todo: extract function - for sum, too
        if (negateCost) { costWithIncome = -costWithIncome; }
        let dataObj = {
            desc: p.file.link,
            cost: (p['cost'] ?? 0),
            cost_income: (p['cost_income'] ?? 0),
            costWithIncome: costWithIncome,
            cost_date: p['cost_date'] ? moment(p['cost_date'].toString()) : null // convert to moment object
        };
        for (const prop of addProperties) {
            dataObj[prop] = p[prop];
        }
        return dataObj;
    })
    .sort(e => [-e.cost_date, e.desc]);

// ToDo: optional group by totals, year, month, ...
// ToDo: extra-summen per month, etc. definieren

// todo: getTotalFromEntries() for: but how to check for costWithIncome?

// sum of cost
// let sum = entries
//     .filter(p => p.costWithIncome !== 0.0)
//     .map(p => p.costWithIncome)
//     .reduce((acc, val) => acc + val, 0.0);
let sum = dataAggregator.getTotal(entries, 'costWithIncome');


// view-table
dv.table(
    ["⬆️ description", "cost", "⬇️ date"].concat(addPropertyNames),
    entries.map(e => {
        let data = [
            e.desc,
            e.costWithIncome?.toFixed(2),
            e.cost_date?.format('YYYY-MM-DD')
        ];
        // Todo: extract to finbase-helper function (tbd!)
        for (const prop of addProperties) {
            if (typeof e[prop] === 'number') {
                data.push(e[prop].toFixed(2));
            } else if (dv.luxon.DateTime.isDateTime(e[prop])) {
                data.push(e[prop]?.toFormat('yyyy-MM-dd'));// convert DateTime to moment object
            } else {
                data.push(e[prop]);
            }
        }
        return data;
    })
);
// view-sum
if (sum > 0.0) {
    dv.paragraph(`💰 Cost: **${sum.toFixed(2)} €**`);
} else {
    dv.paragraph(`💰 Balance: *${Math.abs(sum).toFixed(2)} €*`);
}

if (worthComparison) {
   // todo worth-comparison! - see finbase_worth.js => selbe Datenbasis bzw. filter verwenden?
}

// todo: weitere Option: vergleich mit einer dv.current()-eigenschaft! siehe auch oben!
descriptor.output();
