const EPSILON = 1e-9;

const asArray = value => value == null ? [] : (Array.isArray(value) ? value : [value]);
const normalizeTag = tag => String(tag ?? "").replace(/^#/, "");
const hasTag = (frontmatter, wanted) => asArray(frontmatter?.tags).some(tag => {
    const normalized = normalizeTag(tag);
    return normalized === wanted || normalized.startsWith(`${wanted}/`);
});
const linkTarget = link => String(link?.path ?? link ?? "")
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0];
const resolveLink = (link, sourcePath) => {
    const target = linkTarget(link);
    return target ? app.metadataCache.getFirstLinkpathDest(target, sourcePath) : null;
};
const number = value => {
    const result = Number(value);
    return Number.isFinite(result) ? result : null;
};
const round = value => Math.round((value + Number.EPSILON) * 1e8) / 1e8;
const closeToZero = value => Math.abs(value) < EPSILON;
const fileFrontmatter = file => app.metadataCache.getFileCache(file)?.frontmatter ?? {};
const postingAccount = posting => posting?.account ?? null;
const investmentPosting = (finance, side, sourcePath) => asArray(finance?.postings?.[side]).find(posting => {
    const accountFile = resolveLink(postingAccount(posting), sourcePath);
    return accountFile && hasTag(fileFrontmatter(accountFile), "finance/account/investment");
});
const linksToAsset = (frontmatter, sourcePath, assetFile) => asArray(frontmatter?.scopes).some(link =>
    resolveLink(link, sourcePath)?.path === assetFile.path
);
const eventKey = event => `${event.date}|${String(event.priority).padStart(2, "0")}|${event.file.path}`;

const calculate = assetFile => {
    const warnings = [];
    const events = [];

    for (const file of app.vault.getMarkdownFiles().filter(file => file.path.startsWith("logs/"))) {
        const frontmatter = fileFrontmatter(file);
        if (!linksToAsset(frontmatter, file.path, assetFile)) continue;

        const finance = frontmatter.finance;
        const amount = number(finance?.amount);
        const date = String(finance?.date ?? "");

        if (hasTag(frontmatter, "finance/statement/order")) {
            const quantity = number(finance?.quantity);
            const debitInvestment = investmentPosting(finance, "debit", file.path);
            const creditInvestment = investmentPosting(finance, "credit", file.path);
            const type = debitInvestment ? "buy" : (creditInvestment ? "sell" : null);
            const depotFile = resolveLink(postingAccount(debitInvestment ?? creditInvestment), file.path);
            if (!date || amount == null || amount <= 0 || quantity == null || quantity <= 0 || !type || !depotFile) {
                warnings.push(`${file.basename}: incomplete or unrecognized order`);
                continue;
            }
            events.push({ file, date, amount, quantity, type, depot: depotFile.path, priority: type === "buy" ? 0 : 2 });
        } else if (hasTag(frontmatter, "finance/statement/dividend")) {
            if (!date || amount == null || amount <= 0) {
                warnings.push(`${file.basename}: incomplete dividend`);
                continue;
            }
            events.push({ file, date, amount, type: "dividend", priority: 1 });
        }
    }

    events.sort((a, b) => eventKey(a).localeCompare(eventKey(b)));

    const depots = new Map();
    const closedCycles = [];
    let currentCycle = null;
    let unassignedDividends = 0;
    const totalQuantity = () => Array.from(depots.values()).reduce((sum, depot) => sum + depot.quantity, 0);
    const newCycle = date => ({
        started: date,
        ended: null,
        purchases: 0,
        sales: 0,
        realizedTrading: 0,
        dividends: 0,
        finalResult: null
    });

    for (const event of events) {
        if (event.type === "dividend") {
            if (currentCycle) {
                currentCycle.dividends += event.amount;
            } else if (closedCycles.length > 0) {
                const lastClosed = closedCycles[closedCycles.length - 1];
                lastClosed.dividends += event.amount;
                lastClosed.finalResult += event.amount;
            } else {
                unassignedDividends += event.amount;
            }
            continue;
        }

        const depot = depots.get(event.depot) ?? { quantity: 0, cost: 0 };
        if (event.type === "buy") {
            if (closeToZero(totalQuantity())) currentCycle = newCycle(event.date);
            depot.quantity += event.quantity;
            depot.cost += event.amount;
            depots.set(event.depot, depot);
            currentCycle.purchases += event.amount;
            continue;
        }

        if (event.quantity > depot.quantity + EPSILON) {
            warnings.push(`${event.file.basename}: sale exceeds the recorded quantity in ${event.depot}`);
            continue;
        }
        if (!currentCycle || closeToZero(depot.quantity)) {
            warnings.push(`${event.file.basename}: sale has no matching open position`);
            continue;
        }

        const averageCost = depot.cost / depot.quantity;
        const assignedCost = averageCost * event.quantity;
        depot.quantity -= event.quantity;
        depot.cost -= assignedCost;
        if (closeToZero(depot.quantity)) {
            depot.quantity = 0;
            depot.cost = 0;
        }
        depots.set(event.depot, depot);
        currentCycle.sales += event.amount;
        currentCycle.realizedTrading += event.amount - assignedCost;

        if (closeToZero(totalQuantity())) {
            currentCycle.ended = event.date;
            currentCycle.finalResult = currentCycle.sales + currentCycle.dividends - currentCycle.purchases;
            closedCycles.push(currentCycle);
            currentCycle = null;
        }
    }

    const currentQuantity = totalQuantity();
    const currentCost = Array.from(depots.values()).reduce((sum, depot) => sum + depot.cost, 0);
    const averageCost = closeToZero(currentQuantity) ? 0 : currentCost / currentQuantity;
    const closedResult = closedCycles.reduce((sum, cycle) => sum + cycle.finalResult, 0);
    const earnedWhileOpen = currentCycle ? currentCycle.realizedTrading + currentCycle.dividends : 0;
    const lifetimeRealized = closedResult + earnedWhileOpen + unassignedDividends;
    const lastClosed = closedCycles[closedCycles.length - 1] ?? null;

    const performance = {
        status: currentCycle ? "open" : (lastClosed ? "closed" : "no-position"),
        current_quantity: round(currentQuantity),
        current_cost: round(currentCost),
        average_cost: round(averageCost),
        realized_trading_current_cycle: round(currentCycle?.realizedTrading ?? 0),
        dividends_current_cycle: round(currentCycle?.dividends ?? 0),
        earned_while_open: round(earnedWhileOpen),
        closed_cycles: closedCycles.length,
        closed_result: round(closedResult),
        lifetime_realized: round(lifetimeRealized)
    };
    if (currentCycle) performance.current_cycle_started = currentCycle.started;
    if (lastClosed) {
        performance.last_closed_cycle = {
            started: lastClosed.started,
            ended: lastClosed.ended,
            purchases: round(lastClosed.purchases),
            sale_proceeds: round(lastClosed.sales),
            dividends: round(lastClosed.dividends),
            result: round(lastClosed.finalResult)
        };
    }
    if (unassignedDividends > 0) performance.dividends_without_position = round(unassignedDividends);
    if (warnings.length > 0) performance.issues = warnings;
    return performance;
};

module.exports = async (tp, targetFile = null) => {
    const assetFile = targetFile ?? tp?.config?.target_file ?? app.workspace.getActiveFile();
    if (!assetFile || assetFile.extension !== "md") throw new Error("No asset note selected");
    if (!hasTag(fileFrontmatter(assetFile), "finance/asset")) {
        throw new Error(`${assetFile.path} is not tagged as a finance asset`);
    }

    const performance = calculate(assetFile);
    await app.fileManager.processFrontMatter(assetFile, frontmatter => {
        frontmatter.asset = { ...(frontmatter.asset ?? {}), performance };
        if (frontmatter.finance?.performance) {
            delete frontmatter.finance.performance;
            if (Object.keys(frontmatter.finance).length === 0) delete frontmatter.finance;
        }
        tp?.user?.ensureFmPropertyOrder?.(frontmatter);
    });
    return performance;
};
