function channelPath(entryId) {
    return `/v2/mailbox/entries/${entryId}/email`;
}
export async function getEmailChannel(client, entryId) {
    return client.get(channelPath(entryId));
}
export async function createEmailChannel(client, entryId, input) {
    return client.post(channelPath(entryId), { email_channel: input });
}
export async function updateEmailChannel(client, entryId, input) {
    return client.patch(channelPath(entryId), { email_channel: input });
}
export async function deleteEmailChannel(client, entryId) {
    await client.delete(channelPath(entryId));
}
export async function activateEmailChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/activate`);
}
export async function deactivateEmailChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/deactivate`);
}
//# sourceMappingURL=email-channel.js.map