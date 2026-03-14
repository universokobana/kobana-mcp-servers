const BASE_PATH = '/v2/mailbox/files';
const ENTRIES_PATH = '/v2/mailbox/entries';
export async function listMailboxFiles(client, filters) {
    return client.get(BASE_PATH, filters);
}
export async function getMailboxFile(client, uid) {
    return client.get(`${BASE_PATH}/${uid}`);
}
export async function createMailboxFile(client, entryUid, input, idempotencyKey) {
    const headers = {};
    if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
    }
    return client.post(`${ENTRIES_PATH}/${entryUid}/files`, { mailbox_file: input }, headers);
}
export async function updateMailboxFile(client, uid, input) {
    return client.patch(`${BASE_PATH}/${uid}`, { mailbox_file: input });
}
export async function deleteMailboxFile(client, uid) {
    await client.delete(`${BASE_PATH}/${uid}`);
}
//# sourceMappingURL=files.js.map