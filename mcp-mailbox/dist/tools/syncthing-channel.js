import { KobanaApiError } from '../api/client.js';
import * as syncthingApi from '../api/syncthing-channel.js';
import { getSyncthingChannelSchema, createSyncthingChannelSchema, updateSyncthingChannelSchema, deleteSyncthingChannelSchema, activateSyncthingChannelSchema, deactivateSyncthingChannelSchema, resendSyncthingInvitesSchema, updateSyncthingStatusSchema, } from '../types/schemas.js';
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
export const getSyncthingChannelTool = {
    name: 'get_mailbox_syncthing_channel',
    description: 'Get the Syncthing channel configuration for a mailbox entry.',
    inputSchema: getSyncthingChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = getSyncthingChannelSchema.parse(args);
            const channel = await syncthingApi.getSyncthingChannel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const createSyncthingChannelTool = {
    name: 'create_mailbox_syncthing_channel',
    description: 'Create a Syncthing channel for a mailbox entry with device name, ID, and folder IDs.',
    inputSchema: createSyncthingChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id, ...input } = createSyncthingChannelSchema.parse(args);
            const channel = await syncthingApi.createSyncthingChannel(client, entry_id, input);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const updateSyncthingChannelTool = {
    name: 'update_mailbox_syncthing_channel',
    description: 'Update the Syncthing channel configuration (name and device_id).',
    inputSchema: updateSyncthingChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id, ...input } = updateSyncthingChannelSchema.parse(args);
            const channel = await syncthingApi.updateSyncthingChannel(client, entry_id, input);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deleteSyncthingChannelTool = {
    name: 'delete_mailbox_syncthing_channel',
    description: 'Delete the Syncthing channel from a mailbox entry. Must deactivate first.',
    inputSchema: deleteSyncthingChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = deleteSyncthingChannelSchema.parse(args);
            await syncthingApi.deleteSyncthingChannel(client, entry_id);
            return { success: true, data: { message: 'Syncthing channel deleted successfully' } };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const activateSyncthingChannelTool = {
    name: 'activate_mailbox_syncthing_channel',
    description: 'Activate the Syncthing channel for a mailbox entry.',
    inputSchema: activateSyncthingChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = activateSyncthingChannelSchema.parse(args);
            const channel = await syncthingApi.activateSyncthingChannel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deactivateSyncthingChannelTool = {
    name: 'deactivate_mailbox_syncthing_channel',
    description: 'Deactivate the Syncthing channel for a mailbox entry.',
    inputSchema: deactivateSyncthingChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = deactivateSyncthingChannelSchema.parse(args);
            const channel = await syncthingApi.deactivateSyncthingChannel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const resendSyncthingInvitesTool = {
    name: 'resend_mailbox_syncthing_invites',
    description: 'Queue resending Syncthing invites for a mailbox entry.',
    inputSchema: resendSyncthingInvitesSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = resendSyncthingInvitesSchema.parse(args);
            const channel = await syncthingApi.resendSyncthingInvites(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const updateSyncthingStatusTool = {
    name: 'update_mailbox_syncthing_status',
    description: 'Queue a status check for the Syncthing channel server.',
    inputSchema: updateSyncthingStatusSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = updateSyncthingStatusSchema.parse(args);
            const channel = await syncthingApi.updateSyncthingStatus(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const syncthingChannelTools = [
    getSyncthingChannelTool,
    createSyncthingChannelTool,
    updateSyncthingChannelTool,
    deleteSyncthingChannelTool,
    activateSyncthingChannelTool,
    deactivateSyncthingChannelTool,
    resendSyncthingInvitesTool,
    updateSyncthingStatusTool,
];
//# sourceMappingURL=syncthing-channel.js.map