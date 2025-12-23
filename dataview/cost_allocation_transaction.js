await dv.view(
    'scripts/dataview/cost_allocation',
    {
        filterKey: "cost_account",
        filterValue: dv.current().file.link,
        negateCost: true
    }
);
