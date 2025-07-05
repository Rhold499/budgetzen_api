import { ConfigService } from '@nestjs/config';
import { SupabaseClient } from '@supabase/supabase-js';
export declare class SupabaseService {
    private configService;
    private supabase;
    constructor(configService: ConfigService);
    getClient(): SupabaseClient;
    uploadFile(bucket: string, path: string, file: Buffer, contentType?: string): Promise<{
        id: string;
        path: string;
        fullPath: string;
    }>;
    getPublicUrl(bucket: string, path: string): Promise<string>;
    deleteFile(bucket: string, path: string): Promise<void>;
}
