function channelPath(entryId) {
    return `/v2/mailbox/entries/${entryId}/syncthing`;
}
export async function getSyncthingChannel(client, entryId) {
    return client.get(channelPath(entryId));
}
export async function createSyncthingChannel(client, entryId, input) {
    return client.post(channelPath(entryId), { syncthing_channel: input });
}
export async function updateSyncthingChannel(client, entryId, input) {
    return client.patch(channelPath(entryId), { syncthing_channel: input });
}
export async function deleteSyncthingChannel(client, entryId) {
    await client.delete(channelPath(entryId));
}
export async function activateSyncthingChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/activate`);
}
export async function deactivateSyncthingChannel(client, entryId) {
    return client.put(`${channelPath(entryId)}/deactivate`);
}
export async function resendSyncthingInvites(client, entryId) {
    return client.put(`${channelPath(entryId)}/resend_invites`);
}
export async function updateSyncthingStatus(client, entryId) {
    return client.put(`${channelPath(entryId)}/update_status`);
}
//# sourceMappingURL=syncthing-channel.js.map