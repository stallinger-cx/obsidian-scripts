/**
 * Class representing a point.
 * @class
 */

class Utils {

    stringifyLinks(listOfLinks) {
        if (!listOfLinks) return "";
        let arr = [];
        if (Array.isArray(listOfLinks)) {
            arr = listOfLinks.map(o => (o?.path ? o.path : (typeof o === "string" ? o : "")));
        } else if (listOfLinks?.path) {
            arr = [listOfLinks.path];
        } else if (typeof listOfLinks === "string") {
            arr = [listOfLinks];
        }
        // Filter out empty strings and join with comma
        return arr.filter(Boolean).join(", ");
    }

    getFirstFrontmatterTag(page, displayLevel) {
        if (!page || !page.file || !page.file.frontmatter || !page.file.frontmatter.tags) return "";
        const tags = page.file.frontmatter.tags;
        let tag = "";
        if (Array.isArray(tags) && tags.length > 0) {
            tag = tags[0];
        } else if (typeof tags === "string") {
            tag = tags;
        }
        if (displayLevel > 0) {
            const parts = tag.split("/");
            return parts.slice(-displayLevel).join("/");
        } else {
            return tag;
        }
    }

}
