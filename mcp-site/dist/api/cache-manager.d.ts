import type { CacheStatus } from '../types/api.js';
export declare class CacheManager {
    private readonly cachePath;
    private readonly contentPath;
    private readonly metadataPath;
    private initialized;
    constructor();
    getCachePath(): string;
    getContentPath(): string;
    getStatus(): CacheStatus;
    private readMetadata;
    private writeMetadata;
    ensureCache(): Promise<void>;
    downloadAndExtract(): Promise<void>;
    refresh(): Promise<void>;
    listFiles(dir?: string): string[];
    readFile(relativePath: string): string | null;
    fileExists(relativePath: string): boolean;
}
export declare function getCacheManager(): CacheManager;
//# sourceMappingURL=cache-manager.d.ts.map