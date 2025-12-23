await dv.view(
    'scripts/dataview/cost_allocation',
    {
        filterKey: "cost_invoice_group",
        filterValue: dv.current().file.link,
        addProperties: ['cost_payer', 'cost_documents']
    }
);
