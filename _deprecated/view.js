dv.paragraph(input);

const {Consts} = customJS; // consts.js
import('../consts.js'); // for the IDE to work

class PageReader {
    #nf;

    // get a number-formatter that can handle null/undefined
    getFormatter() {
        if (this.#nf === undefined) {
            this.#nf = new Intl.NumberFormat('en-US', {
                style: "decimal", // alternative: "currency", currency: "EUR"
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
            dv.paragraph('created!!');
        }
        return this.#nf;
    }

    // todo: define fieldNames without const-Class?
    // todo: payer, income, etc.

    getCostDateFieldName() {
        return "cost-date";
    }

    existsCostDate(page) {
        return (page[this.getCostDateFieldName()] !== undefined);
    }

    getCostDate(page) {
        return new Date(page[this.getCostDateFieldName()]);
    }


    getCostDateFmt(page) {
        return moment(this.getCostDate(page)).format("YYYY-MM-DD");
    }

    getCostFieldName() {
        return "cost";
    }

    existsCost(page) {
        return (page[this.getCostFieldName()] !== undefined);
    }

    getCost(page) {
        return page["cost"];
    }

    getCostFmt(page) {
        return this.getFormatter().format(this.getCost(page));
    }

    getFmt(page, fieldName, format) {
        return '???';
        // todo: ??? alternative way?
    }

}

let pageReader = new PageReader(); // todo: put formats here in constructor?
// todo: external


const payerCostData = dv.pages(input.notesPath)
    .filter((p) => {
        return (p[Consts.FN_PAYER] !== undefined) && pageReader.existsCost(p);
    });

const payerIncomeData = dv.pages(input.notesPath)
    .filter((p) => {
        return (p[Consts.FN_PAYER] !== undefined) && (p[Consts.FN_INCOME] !== undefined)
    });


const header = ["Note", "Date", "Cost (€)"];

//let formatter = pageReader.#nf;

dv.table(header, payerCostData.map((row) => {
    return [row.file.link, pageReader.getCostDateFmt(row), pageReader.getCostFmt(row)]
    //return [row.file.link, getCostDateFmt(row), nf.format(row['cost'])]
}));
dv.table(header, payerIncomeData.map((row) => {
    return [row.file.link, pageReader.getCostDateFmt(row), pageReader.getCostFmt(row)]
    //return [row.file.link, getCostDateFmt(row), nf.format(row['cost'])]
}));
dv.paragraph(payerCostData.length);

