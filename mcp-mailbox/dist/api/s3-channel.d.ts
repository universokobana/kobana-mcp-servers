import { KobanaApiClient } from './client.js';
import { S3Channel } from '../types/api.js';
export declare function getS3Channel(client: KobanaApiClient, entryId: string): Promise<S3Channel>;
export declare function createS3Channel(client: KobanaApiClient, entryId: string): Promise<S3Channel>;
export declare function deleteS3Channel(client: KobanaApiClient, entryId: string): Promise<void>;
export declare function activateS3Channel(client: KobanaApiClient, entryId: string): Promise<S3Channel>;
export declare function deactivateS3Channel(client: KobanaApiClient, entryId: string): Promise<S3Channel>;
export declare function updateS3Credentials(client: KobanaApiClient, entryId: string): Promise<S3Channel>;
//# sourceMappingURL=s3-channel.d.ts.map