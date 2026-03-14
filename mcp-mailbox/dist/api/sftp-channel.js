function channelPath(entryId) {
    return `/v2/mailbox/entries/${entryId}/sftp`;
}
export async function getSftpChannel(client, entryId) {
    return client.get(channelPath(entryId));
}
export async function createSftpChannel(client, entryId, input) {
    return client.post(channelPath(entryId), { sftp_channel: input });
}
export async function updateSftpChannel(client, entryId, input) {
    return client.patch(channelPath(entryId), { sftp_channel: input });
}
export async function deleteSftpChannel(client, entryId) {
    await client.delete(channelPath(entryId));
}
export async function activateSftpChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/activate`);
}
export async function deactivateSftpChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/deactivate`);
}
export async function fetchSftpFiles(client, entryId) {
    return client.put(`${channelPath(entryId)}/fetch`);
}
export async function updateSftpCredentials(client, entryId) {
    return client.put(`${channelPath(entryId)}/update_password`);
}
//# sourceMappingURL=sftp-channel.js.map