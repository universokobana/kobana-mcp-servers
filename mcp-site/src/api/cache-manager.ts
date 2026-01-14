import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';
import envPaths from 'env-paths';
import AdmZip from 'adm-zip';
import { getConfig } from '../config.js';
import type { CacheStatus } from '../types/api.js';

const CACHE_NAME = 'kobana-mcp-site';
const CONTENT_DIR = 'content';
const METADATA_FILE = 'metadata.json';

interface CacheMetadata {
  lastUpdated: string;
  sourceUrl: string;
}

export class CacheManager {
  private readonly cachePath: string;
  private readonly contentPath: string;
  private readonly metadataPath: string;
  private initialized: boolean = false;

  constructor() {
    const paths = envPaths(CACHE_NAME);
    this.cachePath = paths.cache;
    this.contentPath = path.join(this.cachePath, CONTENT_DIR);
    this.metadataPath = path.join(this.cachePath, METADATA_FILE);
  }

  getCachePath(): string {
    return this.cachePath;
  }

  getContentPath(): string {
    return this.contentPath;
  }

  getStatus(): CacheStatus {
    const exists = fs.existsSync(this.contentPath) && fs.existsSync(this.metadataPath);
    let lastUpdated: Date | undefined;

    if (exists) {
      try {
        const metadata = this.readMetadata();
        lastUpdated = new Date(metadata.lastUpdated);
      } catch {
        // Metadata corrupt, treat as not exists
      }
    }

    return {
      exists,
      path: this.contentPath,
      lastUpdated,
    };
  }

  private readMetadata(): CacheMetadata {
    const content = fs.readFileSync(this.metadataPath, 'utf-8');
    return JSON.parse(content) as CacheMetadata;
  }

  private writeMetadata(metadata: CacheMetadata): void {
    fs.writeFileSync(this.metadataPath, JSON.stringify(metadata, null, 2), 'utf-8');
  }

  async ensureCache(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const status = this.getStatus();
    if (!status.exists) {
      console.error('[CacheManager] Cache not found, downloading...');
      await this.downloadAndExtract();
    } else {
      console.error(`[CacheManager] Using cached content from ${status.path}`);
    }

    this.initialized = true;
  }

  async downloadAndExtract(): Promise<void> {
    const config = getConfig();
    const zipUrl = config.siteZipUrl;

    console.error(`[CacheManager] Downloading from ${zipUrl}...`);

    // Ensure cache directory exists
    fs.mkdirSync(this.cachePath, { recursive: true });

    // Download the ZIP file
    const response = await fetch(zipUrl);
    if (!response.ok) {
      throw new Error(`Failed to download ZIP: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.error(`[CacheManager] Downloaded ${buffer.length} bytes`);

    // Clean up existing content directory if it exists
    if (fs.existsSync(this.contentPath)) {
      fs.rmSync(this.contentPath, { recursive: true, force: true });
    }

    // Extract the ZIP file
    console.error(`[CacheManager] Extracting to ${this.contentPath}...`);
    const zip = new AdmZip(buffer);
    zip.extractAllTo(this.contentPath, true);

    // Write metadata
    const metadata: CacheMetadata = {
      lastUpdated: new Date().toISOString(),
      sourceUrl: zipUrl,
    };
    this.writeMetadata(metadata);

    console.error('[CacheManager] Cache initialized successfully');
  }

  async refresh(): Promise<void> {
    console.error('[CacheManager] Refreshing cache...');
    await this.downloadAndExtract();
    this.initialized = true;
  }

  listFiles(dir?: string): string[] {
    const searchDir = dir ? path.join(this.contentPath, dir) : this.contentPath;

    if (!fs.existsSync(searchDir)) {
      return [];
    }

    const files: string[] = [];
    const walkDir = (currentDir: string): void => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walkDir(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // Return relative path from content directory
          files.push(path.relative(this.contentPath, fullPath));
        }
      }
    };

    walkDir(searchDir);
    return files;
  }

  readFile(relativePath: string): string | null {
    const fullPath = path.join(this.contentPath, relativePath);

    // Security check: ensure the path doesn't escape the content directory
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(this.contentPath)) {
      throw new Error('Invalid path: attempting to access outside content directory');
    }

    if (!fs.existsSync(resolvedPath)) {
      return null;
    }

    return fs.readFileSync(resolvedPath, 'utf-8');
  }

  fileExists(relativePath: string): boolean {
    const fullPath = path.join(this.contentPath, relativePath);
    const resolvedPath = path.resolve(fullPath);

    if (!resolvedPath.startsWith(this.contentPath)) {
      return false;
    }

    return fs.existsSync(resolvedPath);
  }
}

// Singleton instance
let cacheManagerInstance: CacheManager | null = null;

export function getCacheManager(): CacheManager {
  if (!cacheManagerInstance) {
    cacheManagerInstance = new CacheManager();
  }
  return cacheManagerInstance;
}
