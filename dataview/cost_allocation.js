// @ts-check

/**
 * @fileoverview Cost and sum where property 'cost_allocation' == current file-link.
 * @description
 */

/**
 * @typedef {Object} ScriptInput
 * @property {string} [filterTags]
 * @property {string} [filterKey] - filterkey must be string.
 *  Could be, 'relates_to', 'cost_invoice_group', etc. Defaults to 'relates_to' if not set.
 * @property {any} [filterValue] - filterValue must be string or Obsidian link (object with 'path' property).
 *  If not set, it defaults to the current file link.
 * @property {boolean} [negateCost]
 */

/** @type {ScriptInput} */
// @ts-ignore
const params = input;

const c = customJS.Constants;
const dashboard = customJS.FinBaseDashboard;
const filterContext = customJS.DataParams.createFilterContextCompat(
    [c.FOLDER.NOTES],
    params?.filterTags,
    (params?.filterKey ?? c.PROPERTY.RELATES_TO),
    (params?.filterValue ?? dv.current().file.link)
);

// Negate cost (for transactions-view)
dashboard.displayCostAllocation(dv,
    filterContext,
    { relates_to: '',
      cost_target: 'cost_target (depot)',
      cost_account: 'cost_account (from)' }, // todo: rendering-params-object
    { negateCost: (params?.negateCost ?? false) }
);
