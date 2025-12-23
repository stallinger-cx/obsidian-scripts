await dv.view(
    'scripts/dataview/cost_allocation',
    {
        filterKey: "cost_payer",
        filterValue: dv.current().file.link,
        addProperties: ['cost_documents', 'notes']
    }
);
