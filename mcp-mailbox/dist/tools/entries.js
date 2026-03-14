import { KobanaApiError } from '../api/client.js';
import * as entriesApi from '../api/entries.js';
import { listMailboxEntriesSchema, getMailboxEntrySchema, createMailboxEntrySchema, updateMailboxEntrySchema, deleteMailboxEntrySchema, } from '../types/schemas.js';
function formatError(error) {
    if (error instanceof KobanaApiError) {
        return {
            error: error.message,
            details: error.toJSON(),
        };
    }
    if (error instanceof Error) {
        return { error: error.message };
    }
    return { error: 'Unknown error occurred' };
}
export const listMailboxEntriesTool = {
    name: 'list_mailbox_entries',
    description: 'List all mailbox entries (caixas postais). Supports pagination.',
    inputSchema: listMailboxEntriesSchema,
    handler: async (client, args) => {
        try {
            const params = listMailboxEntriesSchema.parse(args);
            const entries = await entriesApi.listMailboxEntries(client, params);
            return { success: true, data: entries };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const getMailboxEntryTool = {
    name: 'get_mailbox_entry',
    description: 'Get details of a specific mailbox entry by its UID.',
    inputSchema: getMailboxEntrySchema,
    handler: async (client, args) => {
        try {
            const { uid } = getMailboxEntrySchema.parse(args);
            const entry = await entriesApi.getMailboxEntry(client, uid);
            return { success: true, data: entry };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const createMailboxEntryTool = {
    name: 'create_mailbox_entry',
    description: 'Create a new mailbox entry. Requires a name and kind (document, import_export, or edi_cnab).',
    inputSchema: createMailboxEntrySchema,
    handler: async (client, args) => {
        try {
            const input = createMailboxEntrySchema.parse(args);
            const entry = await entriesApi.createMailboxEntry(client, input);
            return { success: true, data: entry };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const updateMailboxEntryTool = {
    name: 'update_mailbox_entry',
    description: 'Update an existing mailbox entry.',
    inputSchema: updateMailboxEntrySchema,
    handler: async (client, args) => {
        try {
            const { uid, ...input } = updateMailboxEntrySchema.parse(args);
            const entry = await entriesApi.updateMailboxEntry(client, uid, input);
            return { success: true, data: entry };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deleteMailboxEntryTool = {
    name: 'delete_mailbox_entry',
    description: 'Delete a mailbox entry. Cannot delete entries that still have files.',
    inputSchema: deleteMailboxEntrySchema,
    handler: async (client, args) => {
        try {
            const { uid } = deleteMailboxEntrySchema.parse(args);
            await entriesApi.deleteMailboxEntry(client, uid);
            return { success: true, data: { message: 'Mailbox entry deleted successfully' } };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const entriesTools = [
    listMailboxEntriesTool,
    getMailboxEntryTool,
    createMailboxEntryTool,
    updateMailboxEntryTool,
    deleteMailboxEntryTool,
];
//# sourceMappingURL=entries.js.map