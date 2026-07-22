import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAccess } from "@/lib/auth";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseBucket = "memories";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "audio/mpeg",
    "audio/wav",
    "audio/mp3",
    "audio/ogg",
    "audio/webm",
]);

const ALLOWED_EXTENSIONS = new Set([
    "jpg", "jpeg", "png", "webp", "gif",
    "mp3", "wav", "ogg", "webm",
]);

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
                { success: false, error: "Chưa chọn tệp" },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { success: false, error: `Tệp quá lớn. Tối đa: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
                { status: 400 }
            );
        }

        const ext = (file.name.split(".").pop() || "").toLowerCase();
        if (!ALLOWED_MIME_TYPES.has(file.type) || !ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json(
                { success: false, error: "Loại tệp không được hỗ trợ. Chỉ chấp nhận ảnh (JPEG, PNG, WebP, GIF) và âm thanh (MP3, WAV, OGG)" },
                { status: 400 }
            );
        }

        if (!slug) {
            return NextResponse.json(
                { success: false, error: "Chưa có slug" },
                { status: 400 }
            );
        }

        const access = await verifyAccess(slug);
        if (!access.success) {
            return NextResponse.json(
                { success: false, error: access.error || "Chưa xác thực" },
                { status: 401 }
            );
        }

        const isValidJwt = supabaseServiceKey && supabaseServiceKey.startsWith("eyJ");
        if (!isValidJwt) {
            console.error(
                "SUPABASE_SERVICE_ROLE_KEY is missing or not a valid JWT.\n" +
                "Get it from: Supabase Dashboard → Project Settings → API → service_role key"
            );
            return NextResponse.json(
                { success: false, error: "Dịch vụ lưu trữ chưa được cấu hình" },
                { status: 500 }
            );
        }
        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: { persistSession: false },
        });

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const filename = `${slug}/${type || "image"}_${timestamp}_${randomSuffix}.${ext}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { data, error } = await supabase.storage
            .from(supabaseBucket)
            .upload(filename, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        }

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
            { success: false, error: "Lỗi máy chủ nội bộ" },
            { status: 500 }
        );
    }
}
