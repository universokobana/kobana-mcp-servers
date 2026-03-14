import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    per_page: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    per_page?: number | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
}>;
export declare const listMailboxEntriesSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    per_page: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    per_page?: number | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
}>;
export declare const getMailboxEntrySchema: z.ZodObject<{
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
}, {
    uid: string;
}>;
export declare const createMailboxEntrySchema: z.ZodObject<{
    name: z.ZodString;
    kind: z.ZodEnum<["document", "import_export", "edi_cnab"]>;
    slug: z.ZodOptional<z.ZodString>;
    send_encrypted: z.ZodOptional<z.ZodBoolean>;
    send_encryption_public_key: z.ZodOptional<z.ZodString>;
    receive_encrypted: z.ZodOptional<z.ZodBoolean>;
    receive_encryption_keypair_id: z.ZodOptional<z.ZodString>;
    external_id: z.ZodOptional<z.ZodString>;
    custom_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    kind: "document" | "import_export" | "edi_cnab";
    slug?: string | undefined;
    send_encrypted?: boolean | undefined;
    send_encryption_public_key?: string | undefined;
    receive_encrypted?: boolean | undefined;
    receive_encryption_keypair_id?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
}, {
    name: string;
    kind: "document" | "import_export" | "edi_cnab";
    slug?: string | undefined;
    send_encrypted?: boolean | undefined;
    send_encryption_public_key?: string | undefined;
    receive_encrypted?: boolean | undefined;
    receive_encryption_keypair_id?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
}>;
export declare const updateMailboxEntrySchema: z.ZodObject<{
    uid: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    kind: z.ZodOptional<z.ZodEnum<["document", "import_export", "edi_cnab"]>>;
    slug: z.ZodOptional<z.ZodString>;
    send_encrypted: z.ZodOptional<z.ZodBoolean>;
    send_encryption_public_key: z.ZodOptional<z.ZodString>;
    receive_encrypted: z.ZodOptional<z.ZodBoolean>;
    receive_encryption_keypair_id: z.ZodOptional<z.ZodString>;
    external_id: z.ZodOptional<z.ZodString>;
    custom_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    uid: string;
    name?: string | undefined;
    kind?: "document" | "import_export" | "edi_cnab" | undefined;
    slug?: string | undefined;
    send_encrypted?: boolean | undefined;
    send_encryption_public_key?: string | undefined;
    receive_encrypted?: boolean | undefined;
    receive_encryption_keypair_id?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
}, {
    uid: string;
    name?: string | undefined;
    kind?: "document" | "import_export" | "edi_cnab" | undefined;
    slug?: string | undefined;
    send_encrypted?: boolean | undefined;
    send_encryption_public_key?: string | undefined;
    receive_encrypted?: boolean | undefined;
    receive_encryption_keypair_id?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
}>;
export declare const deleteMailboxEntrySchema: z.ZodObject<{
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
}, {
    uid: string;
}>;
export declare const listMailboxFilesSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodNumber>;
    per_page: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    per_page?: number | undefined;
}, {
    page?: number | undefined;
    per_page?: number | undefined;
}>;
export declare const getMailboxFileSchema: z.ZodObject<{
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
}, {
    uid: string;
}>;
export declare const createMailboxFileSchema: z.ZodObject<{
    entry_uid: z.ZodString;
    name: z.ZodString;
    content_base64: z.ZodOptional<z.ZodString>;
    content_filename: z.ZodOptional<z.ZodString>;
    content_type: z.ZodOptional<z.ZodString>;
    external_id: z.ZodOptional<z.ZodString>;
    custom_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    entry_uid: string;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    content_base64?: string | undefined;
    content_filename?: string | undefined;
    content_type?: string | undefined;
}, {
    name: string;
    entry_uid: string;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    content_base64?: string | undefined;
    content_filename?: string | undefined;
    content_type?: string | undefined;
}>;
export declare const updateMailboxFileSchema: z.ZodObject<{
    uid: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    external_id: z.ZodOptional<z.ZodString>;
    custom_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    uid: string;
    name?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
}, {
    uid: string;
    name?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
}>;
export declare const deleteMailboxFileSchema: z.ZodObject<{
    uid: z.ZodString;
}, "strip", z.ZodTypeAny, {
    uid: string;
}, {
    uid: string;
}>;
export declare const getEmailChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const createEmailChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    inbox_emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label?: string | undefined;
    }, {
        address: string;
        label?: string | undefined;
    }>, "many">>;
    outbox_emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label?: string | undefined;
    }, {
        address: string;
        label?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    inbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
    outbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
}, {
    entry_id: string;
    inbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
    outbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
}>;
export declare const updateEmailChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    inbox_emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label?: string | undefined;
    }, {
        address: string;
        label?: string | undefined;
    }>, "many">>;
    outbox_emails: z.ZodOptional<z.ZodArray<z.ZodObject<{
        address: z.ZodString;
        label: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        address: string;
        label?: string | undefined;
    }, {
        address: string;
        label?: string | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    inbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
    outbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
}, {
    entry_id: string;
    inbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
    outbox_emails?: {
        address: string;
        label?: string | undefined;
    }[] | undefined;
}>;
export declare const deleteEmailChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const activateEmailChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const deactivateEmailChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const getS3ChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const createS3ChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const deleteS3ChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const activateS3ChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const deactivateS3ChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const updateS3CredentialsSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const getSftpChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const createSftpChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    host: z.ZodOptional<z.ZodString>;
    port: z.ZodOptional<z.ZodNumber>;
    key: z.ZodOptional<z.ZodString>;
    inbox_path: z.ZodOptional<z.ZodString>;
    outbox_path: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    key?: string | undefined;
    username?: string | undefined;
    host?: string | undefined;
    port?: number | undefined;
    inbox_path?: string | undefined;
    outbox_path?: string | undefined;
}, {
    entry_id: string;
    key?: string | undefined;
    username?: string | undefined;
    host?: string | undefined;
    port?: number | undefined;
    inbox_path?: string | undefined;
    outbox_path?: string | undefined;
}>;
export declare const updateSftpChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    username: z.ZodOptional<z.ZodString>;
    key: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    key?: string | undefined;
    username?: string | undefined;
}, {
    entry_id: string;
    key?: string | undefined;
    username?: string | undefined;
}>;
export declare const deleteSftpChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const activateSftpChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const deactivateSftpChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const fetchSftpFilesSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const updateSftpCredentialsSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const getWhatsAppChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const createWhatsAppChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    inbox_phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        country_code: z.ZodString;
        local_code: z.ZodString;
        number: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        country_code: string;
        local_code: string;
    }, {
        number: string;
        country_code: string;
        local_code: string;
    }>, "many">>;
    outbox_phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        country_code: z.ZodString;
        local_code: z.ZodString;
        number: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        country_code: string;
        local_code: string;
    }, {
        number: string;
        country_code: string;
        local_code: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    inbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
    outbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
}, {
    entry_id: string;
    inbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
    outbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
}>;
export declare const updateWhatsAppChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    inbox_phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        country_code: z.ZodString;
        local_code: z.ZodString;
        number: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        country_code: string;
        local_code: string;
    }, {
        number: string;
        country_code: string;
        local_code: string;
    }>, "many">>;
    outbox_phones: z.ZodOptional<z.ZodArray<z.ZodObject<{
        country_code: z.ZodString;
        local_code: z.ZodString;
        number: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        number: string;
        country_code: string;
        local_code: string;
    }, {
        number: string;
        country_code: string;
        local_code: string;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    inbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
    outbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
}, {
    entry_id: string;
    inbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
    outbox_phones?: {
        number: string;
        country_code: string;
        local_code: string;
    }[] | undefined;
}>;
export declare const deleteWhatsAppChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const activateWhatsAppChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const deactivateWhatsAppChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const getSyncthingChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const createSyncthingChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    device_id: z.ZodOptional<z.ZodString>;
    inbox_folder_id: z.ZodOptional<z.ZodString>;
    outbox_folder_id: z.ZodOptional<z.ZodString>;
    external_id: z.ZodOptional<z.ZodString>;
    custom_data: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    name?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    device_id?: string | undefined;
    inbox_folder_id?: string | undefined;
    outbox_folder_id?: string | undefined;
}, {
    entry_id: string;
    name?: string | undefined;
    external_id?: string | undefined;
    custom_data?: Record<string, unknown> | undefined;
    tags?: string[] | undefined;
    device_id?: string | undefined;
    inbox_folder_id?: string | undefined;
    outbox_folder_id?: string | undefined;
}>;
export declare const updateSyncthingChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
    name: z.ZodOptional<z.ZodString>;
    device_id: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
    name?: string | undefined;
    device_id?: string | undefined;
}, {
    entry_id: string;
    name?: string | undefined;
    device_id?: string | undefined;
}>;
export declare const deleteSyncthingChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const activateSyncthingChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const deactivateSyncthingChannelSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const resendSyncthingInvitesSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
export declare const updateSyncthingStatusSchema: z.ZodObject<{
    entry_id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    entry_id: string;
}, {
    entry_id: string;
}>;
//# sourceMappingURL=schemas.d.ts.map