function getTasksQuery(query, options)
{
    if (options !== undefined) {
        query += '\n' + options;
    }
    return '```tasks\n' + query + '\n```';
}

// creates a tasks-query, filtering filename, heading and description by name
function getTasksQueryFilteredByName(name, options)
{
    const query = `
        not done
        (filename includes ${name}) OR (heading includes ${name}) OR (description includes ${name})
        sort by urgency
        short mode
    `;
    return  getTasksQuery(query, options);
}

// creates a tasks-query, filtering by note-tag
function getTasksQueryGroupedByNoteTag(name, options)
{
    // TODO: !!!
    const query = `
    
        (filename includes ${name}) OR (heading includes ${name}) OR (description includes ${name})
        sort by urgency
        short mode
    `;
    return  getTasksQuery(query, options);
}

exports.getTasksQuery = getTasksQuery;
exports.getTasksQueryFilteredByName = getTasksQueryFilteredByName;
//exports.getTasksQueryGroupedByNoteTag = getTasksQueryGroupedByNoteTag;
