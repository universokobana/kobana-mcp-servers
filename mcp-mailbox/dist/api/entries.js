const BASE_PATH = '/v2/mailbox/entries';
export async function listMailboxEntries(client, filters) {
    return client.get(BASE_PATH, filters);
}
export async function getMailboxEntry(client, uid) {
    return client.get(`${BASE_PATH}/${uid}`);
}
export async function createMailboxEntry(client, input, idempotencyKey) {
    const headers = {};
    if (idempotencyKey) {
        headers['X-Idempotency-Key'] = idempotencyKey;
    }
    return client.post(BASE_PATH, { mailbox_entry: input }, headers);
}
export async function updateMailboxEntry(client, uid, input) {
    return client.patch(`${BASE_PATH}/${uid}`, { mailbox_entry: input });
}
export async function deleteMailboxEntry(client, uid) {
    await client.delete(`${BASE_PATH}/${uid}`);
}
//# sourceMappingURL=entries.js.map