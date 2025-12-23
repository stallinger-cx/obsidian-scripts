class CostExplorer {

    // ToDo: nest a class to create an instance?

    doExperiment(dv) {
        // external function 2: pass page and array of key-names, return first one, that is not null
        function getCreatedOrCostDate(page) {
            if (page["cost-date"]) {
                return new Date(page["cost-date"]);
            } else {
                return new Date(page["created"]);
            }
        }

        // external function x: get a number-formatter that can handle null/undefined
        const nf = new Intl.NumberFormat('en-US', {
            style: "decimal", // "currency", currency: "EUR"
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        // external function 1: get data by name/tag, that does not include the current filename
        let thisFileName = dv.current().file.name;
        const queryData = dv.pages("#family/kleidung")
            .filter(p => ((p.file.name != thisFileName) && (p.file.name.includes(thisFileName))));

        // external function xxx: pass a data array in a given format, get table grouped by year/month, etc.
        // grouped by cost-date (fallback by date created)
        const header = ["Note", "Date", "Cost (€)"];

        let sumMonth = 0.0;
        let sumYear = 0.0;
        let sumTotal = 0.0;
        let currentYear, currentMonth;

        for (let group of queryData
            .groupBy((p) => {
                let date = getCreatedOrCostDate(p);
                let jsonKey = {
                    year: date.getFullYear(),
                    month: (date.getMonth() + 1) // don't ask, why month begins with 0...
                }
                jsonKey['sortStr'] = jsonKey.year + String(jsonKey.month).padStart(2, '0');
                return jsonKey;
            })
            .sort(group => group.key.sortStr, 'desc')) {
            // group are key-value pairs, where key and value are objects respective other arrays
            if (group.key.year != currentYear) {
                sumYear = 0.0;
                currentYear = group.key.year;
                dv.header(2, group.key.year);
            }
            if (group.key.month != currentMonth) {
                sumMonth = 0.0;
                currentMonth = group.key.month;
                dv.header(3, group.key.month);
            }

            // rowData: monthly entries: sort rows inside of this group
            let rowData = group.rows.sort(row => row['cost-date'], 'desc');
            // calc sums
            for (let cost of rowData['cost']) {
                sumMonth += cost;
            } // all data within a month
            sumYear += sumMonth;
            sumTotal += sumMonth;


        }

        // Sum total line
        dv.header(2, "Sum total");
        dv.table(["", "Total cost (€)"], [["**Sum total**", nf.format(sumTotal)]]);

    }
}
