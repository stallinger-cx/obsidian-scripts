/**
 * @fileoverview    Displays sending and receiving entities for an email-address.
 * @description
 */

const allAliases = [...[dv.current().file.name], ...dv.current().file.aliases];

dv.paragraph('## Looked up addresses');
dv.paragraph(allAliases);

dv.paragraph('## Sending');
dv.table(
  ['From', 'Sending-Address', 'Usage'],
  dv.pages('"notes"')
    .filter(p => allAliases.some(alias => p.email_send?.toString().includes(alias)))
    .map(p => [p.file.link, p.email_send, p.email_send_for])
);

dv.paragraph('## Receiving');
dv.table(
  ['For', 'Receiving-Address', 'Usage'],
  dv.pages('"notes"')
    .filter(p => allAliases.some(alias => p.email_receive?.toString().includes(alias)))
    .map(p => [p.file.link, p.email_receive, p.email_receive_for])
);
