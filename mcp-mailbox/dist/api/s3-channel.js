function channelPath(entryId) {
    return `/v2/mailbox/entries/${entryId}/s3`;
}
export async function getS3Channel(client, entryId) {
    return client.get(channelPath(entryId));
}
export async function createS3Channel(client, entryId) {
    return client.post(channelPath(entryId), {});
}
export async function deleteS3Channel(client, entryId) {
    await client.delete(channelPath(entryId));
}
export async function activateS3Channel(client, entryId) {
    return client.put(`${channelPath(entryId)}/activate`);
}
export async function deactivateS3Channel(client, entryId) {
    return client.put(`${channelPath(entryId)}/deactivate`);
}
export async function updateS3Credentials(client, entryId) {
    return client.put(`${channelPath(entryId)}/update_password`);
}
//# sourceMappingURL=s3-channel.js.map