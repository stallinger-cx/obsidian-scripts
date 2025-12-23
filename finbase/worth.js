/**
 * @fileoverview    FinBase worth where log_type=='worth' and relates_to==current file-link.js
 * @author          Michael J. Stallinger
 * @description
 */

const descriptor = customJS.Descriptor.create(dv, true /*enabled*/);
const dataFilter = customJS.DataFilter.create(descriptor);
const dataLoader = customJS.DataLoader.create(dv, dataFilter, descriptor);
const dataAggregator = customJS.DataAggregator.create(descriptor);
const consts = customJS.FinBaseConstants;

// Load entries of type 'worth' from logs, relating the current file
let entries = dataLoader.getNotesFiltered(
        consts.DATADIR_LOGS,
        [],
        [consts.PROPERTY_LOG_TYPE, consts.PROPERTY_RELATES_TO],
        [consts.LOG_TYPE_WORTH, dv.current().file.link]);
// group by 'cost_account', get most recent per group
let groupedEntries = dataAggregator.getLatestPerGroup(
        entries,
        consts.PROPERTY_COST_ACCOUNT);
// sum total worth
let totalWorth = dataAggregator.getTotal(
        groupedEntries,
        consts.PROPERTY_LOG_VALUE);

// display table (optional)
dv.table(
    ["worth-entry", "created", "worth"],
    groupedEntries.map(e => [
        e.file.link,
        e.created.toFormat('yyyy-MM-dd HH:mm'),
        e.log_value?.toFixed(2)
    ])
);
// display total worth
dv.paragraph(`🧈 Total worth: **${totalWorth?.toFixed(2) ?? "0.00"}**`);
// display descriptor output (optional)
descriptor.output();
