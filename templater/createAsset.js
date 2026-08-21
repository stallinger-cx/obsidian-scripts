const asArray = value => value == null ? [] : (Array.isArray(value) ? value : [value]);

const normalizeTag = tag => String(tag ?? "").replace(/^#/, "");

const clean = value => {
    const result = String(value ?? "").trim();
    return result === "" ? null : result;
};

const promptValue = async (tp, title, currentValue = "", required = false) => {
    let suggestion = currentValue == null ? "" : String(currentValue);
    let promptTitle = title;
    while (true) {
        const value = await tp.system.prompt(promptTitle, suggestion, true);
        if (value == null) return null;
        const normalized = clean(value);
        if (normalized || !required) return normalized;
        suggestion = value;
        promptTitle = `${title} — a value is required`;
    }
};

const assetTypes = {
    stock: {
        tag: "finance/asset/stock",
        prefix: "Stock",
        asksIsin: true,
        asksCusip: true,
        asksExchange: true,
        asksGics: true,
        asksCoinGecko: false
    },
    etf: {
        tag: "finance/asset/etf",
        prefix: "ETF",
        asksIsin: true,
        asksCusip: false,
        asksExchange: true,
        asksGics: false,
        asksCoinGecko: false
    },
    crypto: {
        tag: "finance/asset/crypto",
        prefix: "Cryptocurrency",
        asksIsin: false,
        asksCusip: false,
        asksExchange: true,
        defaultExchange: "CRYPTO",
        asksGics: false,
        asksCoinGecko: true
    }
};

const chooseExchange = async (tp, currentValue) => {
    const current = clean(currentValue);
    const currentTarget = linkTarget(current);
    const options = app.vault.getMarkdownFiles()
        .filter(file => asArray(app.metadataCache.getFileCache(file)?.frontmatter?.tags)
            .map(normalizeTag)
            .includes("finance/market/venue"))
        .map(file => {
            const fm = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
            return {
                file,
                code: fm.venue?.code ?? file.basename,
                name: asArray(fm.aliases)[0] ?? fm.venue?.name ?? file.basename
            };
        })
        .sort((a, b) => {
            const aCurrent = a.code === current || a.file.basename === currentTarget;
            const bCurrent = b.code === current || b.file.basename === currentTarget;
            return Number(bCurrent) - Number(aCurrent) || a.code.localeCompare(b.code, "en");
        });
    const custom = Symbol("custom-exchange");
    const selected = await tp.system.suggester(
        [...options.map(item => `${item.code} — ${item.name}`), "Other / custom…"],
        [...options.map(item => `[[${item.file.basename}|${item.code}]]`), custom],
        false,
        "Exchange"
    );
    if (selected === custom) return promptValue(tp, "Exchange code", current, true);
    return selected;
};

const assetNameFromTitle = (title, prefix) => {
    const escapedPrefix = prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = String(title ?? "").match(new RegExp(`^${escapedPrefix}\\s+'(.+)'$`));
    return match?.[1] ?? "";
};

const safeFilePart = value => String(value ?? "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim();

const uniqueNotePath = (type, name, currentFile) => {
    const base = `${type.prefix} '${safeFilePart(name)}'`;
    let path = `notes/${base}.md`;
    let index = 2;
    while (app.vault.getAbstractFileByPath(path) && app.vault.getAbstractFileByPath(path) !== currentFile) {
        path = `notes/${base} (${index}).md`;
        index += 1;
    }
    return path.replace(/\.md$/, "");
};

const linkTarget = link => String(link ?? "")
    .replace(/^\[\[/, "")
    .replace(/\]\]$/, "")
    .split("|")[0];

const chooseGicsSector = async (tp, currentValue) => {
    const files = app.vault.getMarkdownFiles()
        .filter(file => asArray(app.metadataCache.getFileCache(file)?.frontmatter?.tags)
            .map(normalizeTag)
            .includes("finance/gics/sector"))
        .sort((a, b) => a.basename.localeCompare(b.basename, "en"));

    const currentTarget = linkTarget(currentValue);
    files.sort((a, b) => Number(b.basename === currentTarget) - Number(a.basename === currentTarget));

    const labels = ["— No GICS sector —", ...files.map(file => {
        const fm = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
        const name = asArray(fm.aliases)[0] ?? file.basename;
        return `${name} (${fm.gics?.code ?? "—"})`;
    })];
    const values = [null, ...files.map(file => {
        const name = asArray(app.metadataCache.getFileCache(file)?.frontmatter?.aliases)[0] ?? file.basename;
        return `[[${file.basename}|${name}]]`;
    })];

    return tp.system.suggester(labels, values, false, "GICS sector");
};

module.exports = async (tp, typeName) => {
    if (!typeName) {
        typeName = await tp.system.suggester(
            ["Stock", "ETF", "Cryptocurrency"],
            ["stock", "etf", "crypto"],
            false,
            "Asset type"
        );
        if (!typeName) return;
    }

    const type = assetTypes[typeName];
    if (!type) throw new Error(`Unknown asset type: ${typeName}`);

    const file = tp.config.target_file;
    const fm = app.metadataCache.getFileCache(file)?.frontmatter ?? {};
    const asset = fm.asset ?? {};
    const currentAlias = asArray(fm.aliases).find(value => clean(value));
    const currentName = currentAlias ?? assetNameFromTitle(tp.file.title, type.prefix);

    const name = await promptValue(tp, "Asset name", currentName, true);
    if (!name) return;

    const values = {};
    if (type.asksIsin) values.isin = await promptValue(tp, "ISIN (optional)", asset.isin);
    if (type.asksCusip) values.cusip = await promptValue(tp, "CUSIP (optional)", asset.cusip);
    values.ticker = await promptValue(tp, "Ticker", asset.ticker, true);
    if (!values.ticker) return;
    if (type.asksExchange) {
        values.exchange = await chooseExchange(tp, asset.exchange ?? type.defaultExchange);
    }
    if (type.asksExchange && !values.exchange) return;
    if (type.asksGics) values.gics = await chooseGicsSector(tp, asset.gics);
    if (type.asksCoinGecko) {
        values.coingecko_id = await promptValue(tp, "CoinGecko ID (optional)", asset.coingecko_id);
    }

    await tp.user.handleFm(tp, {}, false);

    await app.fileManager.processFrontMatter(file, frontmatter => {
        const otherAssetTags = Object.values(assetTypes).map(value => value.tag);
        const tags = asArray(frontmatter.tags)
            .filter(tag => clean(tag))
            .map(normalizeTag)
            .filter(tag => !otherAssetTags.includes(tag));
        tags.push(type.tag);

        const nextAsset = { ...asset };
        for (const key of ["isin", "cusip", "ticker", "exchange", "gics", "coingecko_id"]) {
            if (!(key in values) || values[key] == null) delete nextAsset[key];
            else nextAsset[key] = values[key];
        }

        frontmatter.tags = tags;
        frontmatter.aliases = [name];
        frontmatter.asset = nextAsset;
        tp.user.ensureFmPropertyOrder(frontmatter);
    });

    await tp.file.move(uniqueNotePath(type, name, file));
};
