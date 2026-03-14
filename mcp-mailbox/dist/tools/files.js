import { KobanaApiError } from '../api/client.js';
import * as filesApi from '../api/files.js';
import { listMailboxFilesSchema, getMailboxFileSchema, createMailboxFileSchema, updateMailboxFileSchema, deleteMailboxFileSchema, } from '../types/schemas.js';
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
export const listMailboxFilesTool = {
    name: 'list_mailbox_files',
    description: 'List all mailbox files across all entries. Supports pagination.',
    inputSchema: listMailboxFilesSchema,
    handler: async (client, args) => {
        try {
            const params = listMailboxFilesSchema.parse(args);
            const files = await filesApi.listMailboxFiles(client, params);
            return { success: true, data: files };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const getMailboxFileTool = {
    name: 'get_mailbox_file',
    description: 'Get details of a specific mailbox file by its UID.',
    inputSchema: getMailboxFileSchema,
    handler: async (client, args) => {
        try {
            const { uid } = getMailboxFileSchema.parse(args);
            const file = await filesApi.getMailboxFile(client, uid);
            return { success: true, data: file };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const createMailboxFileTool = {
    name: 'create_mailbox_file',
    description: 'Upload a file to a mailbox entry. Provide entry_uid and file content as Base64.',
    inputSchema: createMailboxFileSchema,
    handler: async (client, args) => {
        try {
            const { entry_uid, ...input } = createMailboxFileSchema.parse(args);
            const file = await filesApi.createMailboxFile(client, entry_uid, input);
            return { success: true, data: file };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const updateMailboxFileTool = {
    name: 'update_mailbox_file',
    description: 'Update a mailbox file metadata (name, external_id, custom_data, tags).',
    inputSchema: updateMailboxFileSchema,
    handler: async (client, args) => {
        try {
            const { uid, ...input } = updateMailboxFileSchema.parse(args);
            const file = await filesApi.updateMailboxFile(client, uid, input);
            return { success: true, data: file };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deleteMailboxFileTool = {
    name: 'delete_mailbox_file',
    description: 'Delete a mailbox file.',
    inputSchema: deleteMailboxFileSchema,
    handler: async (client, args) => {
        try {
            const { uid } = deleteMailboxFileSchema.parse(args);
            await filesApi.deleteMailboxFile(client, uid);
            return { success: true, data: { message: 'Mailbox file deleted successfully' } };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const filesTools = [
    listMailboxFilesTool,
    getMailboxFileTool,
    createMailboxFileTool,
    updateMailboxFileTool,
    deleteMailboxFileTool,
];
//# sourceMappingURL=files.js.map