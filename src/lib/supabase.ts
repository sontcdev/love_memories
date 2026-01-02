import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for the browser
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = "memories";

// Helper to get public URL for a file
export function getPublicUrl(path: string): string {
    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
}

// Helper to generate unique file path
export function generateFilePath(slug: string, filename: string): string {
    const timestamp = Date.now();
    const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
    return `public/${slug}/${timestamp}_${cleanFilename}`;
}
