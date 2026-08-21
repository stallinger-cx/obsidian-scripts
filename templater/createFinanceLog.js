class DatePromptModal {
    constructor(app, title, initialValue) {
        this.title = title;
        this.initialValue = initialValue;
        this.value = null;
    }

    openAndGetValue() {
        return new Promise(resolve => {
            this.resolve = resolve;
            this.open();
        });
    }

    open() {
        this.overlay = document.createElement("div");
        this.overlay.className = "modal-container mod-dim";

        const background = document.createElement("div");
        background.className = "modal-bg";
        background.addEventListener("click", () => this.close());

        const modal = document.createElement("div");
        modal.className = "modal mod-settings mod-templater-finance-date";

        const content = document.createElement("div");
        content.className = "modal-content";

        const heading = document.createElement("h2");
        heading.textContent = this.title;

        const setting = document.createElement("div");
        setting.className = "setting-item";
        const info = document.createElement("div");
        info.className = "setting-item-info";
        const name = document.createElement("div");
        name.className = "setting-item-name";
        name.textContent = "Date";
        info.appendChild(name);

        const control = document.createElement("div");
        control.className = "setting-item-control";
        this.input = document.createElement("input");
        this.input.type = "date";
        this.input.value = this.initialValue;
        this.input.addEventListener("keydown", event => {
            if (event.key === "Enter") this.submit();
            if (event.key === "Escape") this.close();
        });
        control.appendChild(this.input);
        setting.append(info, control);

        const buttons = document.createElement("div");
        buttons.className = "modal-button-container";
        const cancel = document.createElement("button");
        cancel.textContent = "Cancel";
        cancel.addEventListener("click", () => this.close());
        const apply = document.createElement("button");
        apply.className = "mod-cta";
        apply.textContent = "Apply";
        apply.addEventListener("click", () => this.submit());
        buttons.append(cancel, apply);

        content.append(heading, setting, buttons);
        modal.appendChild(content);
        this.overlay.append(background, modal);
        document.body.appendChild(this.overlay);

        window.setTimeout(() => {
            this.input.focus();
            this.input.showPicker?.();
        }, 0);
    }

    submit() {
        const value = this.input?.value;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? "")) return;
        this.value = value;
        this.close();
    }

    close() {
        this.overlay?.remove();
        this.resolve?.(this.value);
        this.resolve = null;
    }
}

const asArray = value => value == null ? [] : (Array.isArray(value) ? value : [value]);

const normalizeTag = tag => String(tag ?? "").replace(/^#/, "");

const hasTag = (file, wanted) => {
    const fm = app.metadataCache.getFileCache(file)?.frontmatter;
    return asArray(fm?.tags).some(tag => {
        const normalized = normalizeTag(tag);
        return normalized === wanted || normalized.startsWith(`${wanted}/`);
    });
};

const wikilink = file => `[[${file.basename}]]`;

const linkTarget = link => String(link ?? "")
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0];

const chooseFile = async (tp, title, predicate, optional = false, currentLink = null) => {
    const files = app.vault.getMarkdownFiles()
        .filter(predicate)
        .sort((a, b) => a.basename.localeCompare(b.basename, "de"));

    const currentTarget = linkTarget(currentLink);
    if (currentTarget) {
        files.sort((a, b) => {
            const aCurrent = a.basename === currentTarget || a.path.replace(/\.md$/, "") === currentTarget;
            const bCurrent = b.basename === currentTarget || b.path.replace(/\.md$/, "") === currentTarget;
            return Number(bCurrent) - Number(aCurrent);
        });
    }

    const labels = files.map(file => file.basename);
    const values = files.map(file => wikilink(file));
    if (optional) {
        labels.unshift("— No counter-account —");
        values.unshift(null);
    }

    return tp.system.suggester(labels, values, false, title);
};

const promptPositiveNumber = async (tp, title, initialValue = "") => {
    let suggestion = initialValue == null ? "" : String(initialValue);
    let promptTitle = title;
    while (true) {
        const raw = await tp.system.prompt(promptTitle, suggestion, true);
        if (raw == null) return null;
        const value = Number(String(raw).trim().replace(",", "."));
        if (Number.isFinite(value) && value > 0) return value;
        suggestion = raw;
        promptTitle = `${title} — please enter a number greater than 0`;
    }
};

const sanitizeTitle = value => String(value ?? "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .replace(/^\d{4}-\d{2}-\d{2}\s+-\s+/, "")
    .trim();

const suggestedTitle = (currentTitle, fallback) => {
    const current = sanitizeTitle(currentTitle);
    return /^(Untitled|Unbenannt|52 - new finance transaction|53 - new stock transaction|55 - new dividend)$/i.test(current)
        ? fallback
        : (current || fallback);
};

const uniqueLogPath = (date, title, currentFile) => {
    const base = `${date} - ${sanitizeTitle(title) || "Finance transaction"}`;
    let path = `logs/${base}.md`;
    let index = 2;
    while (app.vault.getAbstractFileByPath(path) && app.vault.getAbstractFileByPath(path) !== currentFile) {
        path = `logs/${base} (${index}).md`;
        index += 1;
    }
    return path.replace(/\.md$/, "");
};

const currentFrontmatter = tp =>
    app.metadataCache.getFileCache(tp.config.target_file)?.frontmatter ?? {};

const currentPostingAccount = (finance, side) =>
    asArray(finance?.postings?.[side])[0]?.account ?? null;

const writeFinanceLog = async (tp, data) => {
    await tp.user.handleFm(tp, {}, false);
    const file = tp.config.target_file;
    const relatedFile = app.metadataCache.getFirstLinkpathDest(linkTarget(data.forLink), file.path);

    await app.fileManager.processFrontMatter(file, fm => {
        const tags = asArray(fm.tags)
            .filter(tag => tag != null && String(tag).trim() !== "")
            .map(normalizeTag);
        if (!tags.includes(data.tag)) tags.push(data.tag);

        fm.tags = tags;
        fm.for = [data.forLink];
        fm.finance = data.finance;
        tp.user.ensureFmPropertyOrder(fm);
    });

    await tp.file.move(uniqueLogPath(data.date, data.title, file));

    if (relatedFile && (data.tag === "finance/statement/order" || data.tag === "finance/statement/dividend")) {
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const indexedFinance = app.metadataCache.getFileCache(file)?.frontmatter?.finance;
            if (indexedFinance?.date === data.finance.date && indexedFinance?.amount === data.finance.amount) break;
            await new Promise(resolve => window.setTimeout(resolve, 100));
        }
        try {
            await tp.user.updateAssetPerformance(tp, relatedFile);
        } catch (error) {
            console.error(`Could not update performance for ${relatedFile.path}:`, error);
        }
    }
};

const createCashLog = async tp => {
    const fm = currentFrontmatter(tp);
    const finance = fm.finance ?? {};
    const type = await tp.system.suggester(
        ["Expense", "Income"],
        ["expense", "income"],
        false,
        "Transaction type"
    );
    if (!type) return;

    const forLink = await chooseFile(
        tp,
        "Related note",
        file => file.path.startsWith("notes/"),
        false,
        asArray(fm.for)[0]
    );
    if (!forLink) return;

    const amount = await promptPositiveNumber(tp, "Amount", finance.amount);
    if (amount == null) return;

    const date = await new DatePromptModal(app, "Transaction date", finance.date ?? tp.date.now("YYYY-MM-DD"))
        .openAndGetValue();
    if (!date) return;

    const moneySide = type === "expense" ? "credit" : "debit";
    const counterSide = type === "expense" ? "debit" : "credit";
    const moneyAccount = await chooseFile(
        tp,
        type === "expense" ? "Which account did the amount leave?" : "Which account received the amount?",
        file => hasTag(file, "finance/account/checking"),
        false,
        currentPostingAccount(finance, moneySide)
    );
    if (!moneyAccount) return;

    const counterAccount = await chooseFile(
        tp,
        "Counter-account (optional)",
        file => hasTag(file, "finance/account"),
        true,
        currentPostingAccount(finance, counterSide)
    );

    const defaultTitle = suggestedTitle(tp.file.title, `${linkTarget(forLink)} - ${type}`);
    const title = await tp.system.prompt("Log note title", defaultTitle, true);
    if (title == null) return;

    const postings = {
        debit: type === "expense"
            ? (counterAccount ? [{ account: counterAccount, amount }] : [])
            : [{ account: moneyAccount, amount }],
        credit: type === "expense"
            ? [{ account: moneyAccount, amount }]
            : (counterAccount ? [{ account: counterAccount, amount }] : [])
    };

    await writeFinanceLog(tp, {
        tag: "finance/statement/transaction",
        forLink,
        date,
        title,
        finance: { amount, date, postings }
    });
};

const createStockLog = async tp => {
    const fm = currentFrontmatter(tp);
    const finance = fm.finance ?? {};
    const type = await tp.system.suggester(
        ["Buy", "Sell"],
        ["buy", "sell"],
        false,
        "Order type"
    );
    if (!type) return;

    const forLink = await chooseFile(
        tp,
        "Asset",
        file => hasTag(file, "finance/asset"),
        false,
        asArray(fm.for)[0]
    );
    if (!forLink) return;

    const amount = await promptPositiveNumber(tp, "Total amount", finance.amount);
    if (amount == null) return;
    const quantity = await promptPositiveNumber(tp, "Quantity", finance.quantity);
    if (quantity == null) return;

    const date = await new DatePromptModal(app, "Order date", finance.date ?? tp.date.now("YYYY-MM-DD"))
        .openAndGetValue();
    if (!date) return;

    const moneySide = type === "buy" ? "credit" : "debit";
    const depotSide = type === "buy" ? "debit" : "credit";
    const moneyAccount = await chooseFile(
        tp,
        type === "buy" ? "Which account did the amount leave?" : "Which account received the proceeds?",
        file => hasTag(file, "finance/account/checking"),
        false,
        currentPostingAccount(finance, moneySide)
    );
    if (!moneyAccount) return;

    const depotAccount = await chooseFile(
        tp,
        type === "buy" ? "Which investment account received the asset?" : "Which investment account did the asset leave?",
        file => hasTag(file, "finance/account/investment"),
        false,
        currentPostingAccount(finance, depotSide)
    );
    if (!depotAccount) return;

    const defaultTitle = suggestedTitle(tp.file.title, `${linkTarget(forLink)} - ${type}`);
    const title = await tp.system.prompt("Log note title", defaultTitle, true);
    if (title == null) return;

    const postings = type === "buy"
        ? {
            debit: [{ account: depotAccount, amount }],
            credit: [{ account: moneyAccount, amount }]
        }
        : {
            debit: [{ account: moneyAccount, amount }],
            credit: [{ account: depotAccount, amount }]
        };

    await writeFinanceLog(tp, {
        tag: "finance/statement/order",
        forLink,
        date,
        title,
        finance: { amount, quantity, date, postings }
    });
};

const createDividendLog = async tp => {
    const fm = currentFrontmatter(tp);
    const finance = fm.finance ?? {};

    const forLink = await chooseFile(
        tp,
        "Asset",
        file => hasTag(file, "finance/asset"),
        false,
        asArray(fm.for)[0]
    );
    if (!forLink) return;

    const amount = await promptPositiveNumber(tp, "Net amount received", finance.amount);
    if (amount == null) return;

    const date = await new DatePromptModal(app, "Dividend date", finance.date ?? tp.date.now("YYYY-MM-DD"))
        .openAndGetValue();
    if (!date) return;

    const receivingAccount = await chooseFile(
        tp,
        "Which account received the dividend?",
        file => hasTag(file, "finance/account/checking"),
        false,
        currentPostingAccount(finance, "debit")
    );
    if (!receivingAccount) return;

    const counterAccount = await chooseFile(
        tp,
        "Counter-account (optional)",
        file => hasTag(file, "finance/account"),
        true,
        currentPostingAccount(finance, "credit")
    );

    const defaultTitle = suggestedTitle(tp.file.title, `${linkTarget(forLink)} - dividend`);
    const title = await tp.system.prompt("Log note title", defaultTitle, true);
    if (title == null) return;

    const postings = {
        debit: [{ account: receivingAccount, amount }],
        credit: counterAccount ? [{ account: counterAccount, amount }] : []
    };

    await writeFinanceLog(tp, {
        tag: "finance/statement/dividend",
        forLink,
        date,
        title,
        finance: { amount, date, postings }
    });
};

module.exports = async (tp, type) => {
    if (type === "cash") return createCashLog(tp);
    if (type === "stock") return createStockLog(tp);
    if (type === "dividend") return createDividendLog(tp);
    throw new Error(`Unknown finance log type: ${type}`);
};
