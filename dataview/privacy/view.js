// Ensure we have a target to check against
// We use the input object passed from the calling note
const targetPath = input?.target?.path;
if (!targetPath) {
    dv.paragraph("⚠️ No target link provided to view.");
    return;
}
// Fetch all notes from the private directory that contain the 'privacy_backlink' field
const privateNotes = dv.pages('"notes/private"').where(p => p.privacy_backlink);
// Filter the notes where the backlink matches the current public note
const linkedNotes = privateNotes.filter(p => {
    // Normalize to an array to handle both single links and lists of links
    const links = Array.isArray(p.privacy_backlink) ? p.privacy_backlink : [p.privacy_backlink];
    // Check if any of the link objects have a path that matches the target
    return links.some(link => link?.path === targetPath);
});
// Render the output if private extensions exist
if (linkedNotes.length > 0) {
    dv.header(4, "🔒 Private backlinks");
    // Render as a simple list of links
    dv.list(linkedNotes.map(p => p.file.link));
}
