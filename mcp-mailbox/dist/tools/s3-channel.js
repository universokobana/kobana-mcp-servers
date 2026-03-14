import { KobanaApiError } from '../api/client.js';
import * as s3Api from '../api/s3-channel.js';
import { getS3ChannelSchema, createS3ChannelSchema, deleteS3ChannelSchema, activateS3ChannelSchema, deactivateS3ChannelSchema, updateS3CredentialsSchema, } from '../types/schemas.js';
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
export const getS3ChannelTool = {
    name: 'get_mailbox_s3_channel',
    description: 'Get the S3 channel configuration for a mailbox entry, including AWS connection details.',
    inputSchema: getS3ChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = getS3ChannelSchema.parse(args);
            const channel = await s3Api.getS3Channel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const createS3ChannelTool = {
    name: 'create_mailbox_s3_channel',
    description: 'Create an S3 channel for a mailbox entry. AWS Cognito credentials are auto-generated.',
    inputSchema: createS3ChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = createS3ChannelSchema.parse(args);
            const channel = await s3Api.createS3Channel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deleteS3ChannelTool = {
    name: 'delete_mailbox_s3_channel',
    description: 'Delete the S3 channel from a mailbox entry. Must deactivate first.',
    inputSchema: deleteS3ChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = deleteS3ChannelSchema.parse(args);
            await s3Api.deleteS3Channel(client, entry_id);
            return { success: true, data: { message: 'S3 channel deleted successfully' } };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const activateS3ChannelTool = {
    name: 'activate_mailbox_s3_channel',
    description: 'Activate the S3 channel for a mailbox entry.',
    inputSchema: activateS3ChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = activateS3ChannelSchema.parse(args);
            const channel = await s3Api.activateS3Channel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const deactivateS3ChannelTool = {
    name: 'deactivate_mailbox_s3_channel',
    description: 'Deactivate the S3 channel for a mailbox entry.',
    inputSchema: deactivateS3ChannelSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = deactivateS3ChannelSchema.parse(args);
            const channel = await s3Api.deactivateS3Channel(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const updateS3CredentialsTool = {
    name: 'update_mailbox_s3_credentials',
    description: 'Queue an update of the AWS credentials for the S3 channel.',
    inputSchema: updateS3CredentialsSchema,
    handler: async (client, args) => {
        try {
            const { entry_id } = updateS3CredentialsSchema.parse(args);
            const channel = await s3Api.updateS3Credentials(client, entry_id);
            return { success: true, data: channel };
        }
        catch (error) {
            return { success: false, ...formatError(error) };
        }
    },
};
export const s3ChannelTools = [
    getS3ChannelTool,
    createS3ChannelTool,
    deleteS3ChannelTool,
    activateS3ChannelTool,
    deactivateS3ChannelTool,
    updateS3CredentialsTool,
];
//# sourceMappingURL=s3-channel.js.map