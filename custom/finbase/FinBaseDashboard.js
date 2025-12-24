// @ts-check

/**
 * Class representing a point.
 * @class
 */

class FinBaseDashboard {

    async displaySavingsPlans(dv) {

        // IOC container containing relevant objects
        const container = customJS.DataViewServiceContainer.create(dv, dv.current().script_describe);
        // execute the following script (async) using the scriptRunner (pass the same instance of the descriptor)
        await customJS.DataViewScriptRunner.execute(container.descriptor, async () => {
            const consts = customJS.FinBaseConstants;
            // Destructuring ;)
            const { dataLoader, dataSorter, dataFilter, dataAggregator } = container;
            // load savings plan entries, relating to current file
            let entries = dataLoader.getNotesFiltered(
                    consts.DATADIR_NOTES,
                    [consts.TAG_SAVING_PLAN],
                    [consts.PROPERTY_RELATES_TO],
                    [dv.current().file.link]);
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
                        notes: p[consts.PROPERTY_NOTES],
                        status: p[consts.PROPERTY_STATUS],
                        relates_to: p[consts.PROPERTY_RELATES_TO]
                    }
                });
            // sort by...
            entries = dataSorter
                .sort(
                    entries,
                    [
                        { key: consts.PROPERTY_STATUS, desc: false },
                        { key: "costPerMonth", desc: true },
                        { key: "desc.path", desc: false }
                    ]
                );
            // sum of cost per month (only active ones!)
            let sumEntries = dataFilter.filter(
                    entries,
                    [consts.PROPERTY_STATUS],
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

}
