import { KobanaApiError } from '../api/client.js';
import * as emailApi from '../api/email-channel.js';
import { getEmailChannelSchema, createEmailChannelSchema, updateEmailChannelSchema, deleteEmailChannelSchema, activateEmailChannelSchema, deactivateEmailChannelSchema, } from '../types/schemas.js';
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
export const getEmailChannelTool = {
    name: 'get_mailbox_email_channel',
    description: 'Get the email channel configuration for a mailbox entry.',
    inputSchema: getEmailChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = getEmailChannelSchema.parse(args);
            const channel = await emailApi.getEmailChannel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const createEmailChannelTool = {
    name: 'create_mailbox_email_channel',
    description: 'Create an email channel for a mailbox entry with inbox and outbox email addresses.',
    inputSchema: createEmailChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id, ...input } = createEmailChannelSchema.parse(args);
            const channel = await emailApi.createEmailChannel(client, entry_id, input);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const updateEmailChannelTool = {
    name: 'update_mailbox_email_channel',
    description: 'Update the email channel configuration for a mailbox entry.',
    inputSchema: updateEmailChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id, ...input } = updateEmailChannelSchema.parse(args);
            const channel = await emailApi.updateEmailChannel(client, entry_id, input);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deleteEmailChannelTool = {
    name: 'delete_mailbox_email_channel',
    description: 'Delete the email channel from a mailbox entry. Must deactivate first.',
    inputSchema: deleteEmailChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = deleteEmailChannelSchema.parse(args);
            await emailApi.deleteEmailChannel(client, entry_id);
            return { success: true, data: { message: 'Email channel deleted successfully' } };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const activateEmailChannelTool = {
    name: 'activate_mailbox_email_channel',
    description: 'Activate the email channel for a mailbox entry.',
    inputSchema: activateEmailChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = activateEmailChannelSchema.parse(args);
            const channel = await emailApi.activateEmailChannel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deactivateEmailChannelTool = {
    name: 'deactivate_mailbox_email_channel',
    description: 'Deactivate the email channel for a mailbox entry.',
    inputSchema: deactivateEmailChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = deactivateEmailChannelSchema.parse(args);
            const channel = await emailApi.deactivateEmailChannel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const emailChannelTools = [
    getEmailChannelTool,
    createEmailChannelTool,
    updateEmailChannelTool,
    deleteEmailChannelTool,
    activateEmailChannelTool,
    deactivateEmailChannelTool,
];
//# sourceMappingURL=email-channel.js.map