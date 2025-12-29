// @ts-check

/**
 * @fileoverview FinBase-Dashboard
 * @description  Presenting various FinBase-Tables mostly based on dv.current().file.link
 */

class FinBaseDashboard {

    isDescriptorEnabled(dv) {
        return (dv.current()?.script_describe === true);
    }

    get _consts() { return customJS.FinBaseConstants; }

    async _run(dv, asyncFunction) {
        // IOC container containing relevant objects
        const isDescriptorEnabled = this.isDescriptorEnabled(dv);
        const container = customJS.DataViewServiceContainer.create(dv, isDescriptorEnabled);
        // execute the following script (async) using the scriptRunner (pass the same instance of the descriptor)
        await customJS.DataViewScriptRunner.execute(container.descriptor, async () => {
            await asyncFunction(container);
        });
    }

    async displaySavingsPlans(dv) {
        // ToDo: enable to display all savings plans accross all files
        // ToDo: enable status to be passed active/...?
        // ToDo: compare investments per month in asset-classes (tags of related assets)
        await this._run(dv, async(container) => {
            const c = this._consts;
            const relatesToFile = dv.current().file.link;
            const { dataLoader, dataSorter, dataFilter, dataAggregator } = container;
            // load savings plan entries, relating to current file
            let entries = dataLoader.getNotesFiltered(
                    c.DATADIR_NOTES,
                    [c.TAG_SAVING_PLAN],
                    [c.PROPERTY_RELATES_TO],
                    [relatesToFile]);
            // map table values
            entries = entries
                .map(p => {
                    const cost = ((p['cost']) && (typeof p['cost'] === 'number')) ? p['cost'] : null;
                    const costPer = ((p['cost_per']) && (typeof p['cost_per'] === 'number')) ? p['cost_per'] : null;
                    return {
                        tags: p.file.frontmatter.tags ? p.file.frontmatter.tags : [],
                        desc: p.file.link,
                        updated: moment(p['updated']?.toString()), // convert to moment object
                        cost: cost,
                        costPer: costPer,
                        costPerMonth: (cost && costPer) ? (cost / costPer) : null,
                        costPaymentMethods: p['cost_paymentmethods'],
                        notes: p[c.PROPERTY_NOTES],
                        status: p[c.PROPERTY_STATUS],
                        relates_to: p[c.PROPERTY_RELATES_TO]
                    }
                });
            // sort by...
            entries = dataSorter
                .sort(
                    entries,
                    [
                        { key: c.PROPERTY_STATUS, desc: false },
                        { key: "costPerMonth", desc: true },
                        { key: "desc.path", desc: false }
                    ]
                );
            // sum of cost per month (only active ones!)
            let sumEntries = dataFilter.filter(
                    entries,
                    [c.PROPERTY_STATUS],
                    ['active']);
            let sumPerMonth = dataAggregator.getTotal(sumEntries, 'costPerMonth');
            // display the table
            dv.table(
                ["description", "status", "relates_to", "cost", "per", "~ cost p.m.", "paymentmethods", "notes"],
                entries.map(e => [
                    //e.tags.sort().map(tag => '#' + tag),
                    e.desc,
                    e.status,
                    e.relates_to,
                    e.cost?.toFixed(2),
                    e.costPer?.toFixed(2),
                    e.costPerMonth?.toFixed(2),
                    e.costPaymentMethods,
                    e.notes
                ])
            )
            // display sum information
            dv.paragraph(`💰 Sum per month: **${sumPerMonth.toFixed(2)} €**`);
        });
    }

    async displayWorth(dv) {
        await this._run(dv, async(container) => {
            const c = this._consts;
            const relatesToFile = dv.current().file.link;
            const { dataLoader, dataAggregator } = container;
            // Load entries of type 'worth' from logs, relating the current file
            let entries = dataLoader.getNotesFiltered(
                    c.DATADIR_LOGS,
                    [],
                    [c.PROPERTY_LOG_TYPE, c.PROPERTY_RELATES_TO],
                    [c.LOG_TYPE_WORTH, relatesToFile]);
            // group by 'cost_account', get most recent per group
            let groupedEntries = dataAggregator.getLatestPerGroup(
                    entries,
                    c.PROPERTY_COST_ACCOUNT);
            // sum total worth
            let totalWorth = dataAggregator.getTotal(
                    groupedEntries,
                    c.PROPERTY_LOG_VALUE);

            // display table (optional)
            dv.table(
                ["worth-entry", "cost_account", "created", "worth"],
                groupedEntries.map(e => [
                    e.file.link,
                    e.cost_account,
                    e.created.toFormat('yyyy-MM-dd HH:mm'),
                    e.log_value?.toFixed(2)
                ])
            );
            // display total worth
            dv.paragraph(`🧈 Total worth: **${totalWorth?.toFixed(2) ?? "0.00"}**`);
        });
    }

    /**
     * Displays the cost allocation view.
     *
     * @param {DataViewApi} dv
     * @param {FilterParams} filter - filter object, see FilterParams
     * @param {TableColumns} [additionalColumns] - additional fields with names, see TableProperties
     * @param {string|string[]} [options] - additional options
     *  - PARAM_COST_ALLOCATION_OPTION.NEGATED: negates amounts
     *  - PARAM_COST_ALLOCATION_OPTION.WORTH: adds worth-comparison
     */
    async displayCostAllocation(
            dv,
            filter = {},
            additionalColumns = {},
            options = [])
    {
        await this._run(dv, async(container) => {
            const c = this._consts;
            // use defaults, if nothing is passed
            // ToDo: merge, if only tags are passed!!! or do not filter anything???
            const effectiveFilter = (Object.keys(filter).length === 0)
                ? { [c.PROPERTY_RELATES_TO]: dv.current().file.link }
                : filter;
            // destructure container
            const { dataLoader, dataSorter, dataFilter, dataAggregator } = container;

            // ToDo: vielleicht könnte man die Keys gleich direkt aus dv.current().frontmatter holen!?
            // ToDo: Code, der [[file|ALIASES]] entfernt... =>  .map(entry => entry.replace(/\[\[|\]\]/g, '').split('|')[0]) \

            // Additiona fields - Todo: in FinBaseConstants? and change these defaults
            const DEFAULT_TABLE_COLS = {
                'vendor': 'vendor',
                'cost_documents': 'documents'
            };
            const hasUserCols = (additionalColumns && (Object.keys(additionalColumns).length > 0));
            const columns = hasUserCols ? additionalColumns : DEFAULT_TABLE_COLS;
            const addColumnKeys = Object.keys(columns);
            const addColumnLabels = Object.values(columns).map((label, idx) => {
                return label ? label : addColumnKeys[idx];
            });

            // ToDo: maybe, in the future, we run another command, using the data from the view...?
            const activeOptions = Array.isArray(options) ? options : [options];
            // Negate cost (for transactions-view)
            const negateCost = activeOptions.includes(c.PARAM_COST_ALLOCATION_OPTION.NEGATED);
            // Worth-Calculations
            const worthComparison = activeOptions.includes(c.PARAM_COST_ALLOCATION_OPTION.WORTH);


            // todo: weitere Option: vergleich mit einer dv.current()-eigenschaft! siehe auch oben!

            // load data filtered
            let entries = dataLoader.getNotesFilteredObj(c.DATADIR_NOTES, effectiveFilter);
            // filter cost-entries: only those with `cost` or `cost_income` defined, and no `cost_per` defined
            entries = dataFilter.filterCostRelatedEntries(entries);
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
                    for (const prop of addColumnKeys) {
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
                ["⬆️ description", "cost", "⬇️ date"].concat(addColumnLabels),
                entries.map(e => {
                    let data = [
                        e.desc,
                        e.costWithIncome?.toFixed(2),
                        e.cost_date?.format('YYYY-MM-DD')
                    ];
                    // Todo: extract to finbase-helper function (tbd!)
                    for (const prop of addColumnKeys) {
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
                // todo: worth-comparison! - see finbase_worth.js => selbe Datenbasis bzw. filter verwenden?
            }
        });
    }
}
