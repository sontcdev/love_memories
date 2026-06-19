import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

// Initialize Supabase admin client (server-side, bypasses RLS)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Service role key is REQUIRED for server-side storage uploads to bypass RLS.
// Get it from: Supabase Dashboard → Project Settings → API → service_role key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseBucket = "memories"; // Matches STORAGE_BUCKET in src/lib/supabase.ts

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Route segment config - replaces deprecated export const config
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get("file") as File | null;
        const slug = formData.get("slug") as string | null;
        const type = formData.get("type") as string | null;

        if (!file) {
            return NextResponse.json(
                { success: false, error: "No file provided" },
                { status: 400 }
            );
        }

        // Check file size (10MB limit)
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: `File too large. Max size: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        if (!slug) {
            return NextResponse.json(
                { success: false, error: "No slug provided" },
                { status: 400 }
            );
        }

        // Verify user has access to this slug
        const cookieStore = await cookies();
        const accessToken = cookieStore.get(`access_token_${slug}`)?.value;

        if (!accessToken) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        // Initialize Supabase admin client
        // Service role key bypasses RLS — required for server-side uploads
        // Supports both legacy JWT format ("eyJ...") and new Supabase format ("sb_secret_...")
        if (!supabaseServiceKey) {
            console.error(
                "SUPABASE_SERVICE_ROLE_KEY is missing.\n" +
                "Get it from: Supabase Dashboard → Project Settings → API → service_role key"
            );
            return NextResponse.json(
                { success: false, error: "Storage service not configured. Please set SUPABASE_SERVICE_ROLE_KEY in .env" },
                { status: 500 }
            );
        }
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });

        // Generate unique filename
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const ext = file.name.split(".").pop() || "jpg";
        const filename = `${slug}/${type || "image"}_${timestamp}_${randomSuffix}.${ext}`;

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from(supabaseBucket)
            .upload(filename, buffer, {
                contentType: file.type || "image/jpeg",
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(supabaseBucket)
            .getPublicUrl(data.path);

        return NextResponse.json({
            success: true,
            url: urlData.publicUrl,
            path: data.path,
        });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}
