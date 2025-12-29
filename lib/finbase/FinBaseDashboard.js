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
        const relatesToFile = dv.current().file.link;
        await this._run(dv, async(container) => {
            const c = this._consts;
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
        const relatesToFile = dv.current().file.link;
        await this._run(dv, async(container) => {
            const c = this._consts;
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
}
