function channelPath(entryId) {
    return `/v2/mailbox/entries/${entryId}/whatsapp`;
}
export async function getWhatsAppChannel(client, entryId) {
    return client.get(channelPath(entryId));
}
export async function createWhatsAppChannel(client, entryId, input) {
    return client.post(channelPath(entryId), { whatsapp_channel: input });
}
export async function updateWhatsAppChannel(client, entryId, input) {
    return client.patch(channelPath(entryId), { whatsapp_channel: input });
}
export async function deleteWhatsAppChannel(client, entryId) {
    await client.delete(channelPath(entryId));
}
export async function activateWhatsAppChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/activate`);
}
export async function deactivateWhatsAppChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/deactivate`);
}
//# sourceMappingURL=whatsapp-channel.js.map