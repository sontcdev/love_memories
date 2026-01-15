import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';
export const alt = 'Kỷ Niệm Số - Digital Memories';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

interface Props {
    params: Promise<{
        username: string;
    }>;
}

export default async function Image({ params }: Props) {
    const { username } = await params;
    const supabase = await createClient();

    // Fetch link data
    const { data: link } = await supabase
        .from('links')
        .select('settings')
        .eq('username', username)
        .eq('is_active', true)
        .single();

    // Extract data
    const names = link?.settings?.names || ['', ''];
    const anniversaryDate = link?.settings?.anniversary_date;
    const coverPhoto = (link?.settings as any)?.cover_photo || null;

    // Calculate days together
    let daysCount = 0;
    if (anniversaryDate) {
        const start = new Date(anniversaryDate);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - start.getTime());
        daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Fetch Inter font for Vietnamese support
    const fontDataBold = await fetch(
        new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff', import.meta.url)
    ).then((res) => res.arrayBuffer());

    const fontDataRegular = await fetch(
        new URL('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff', import.meta.url)
    ).then((res) => res.arrayBuffer());

    return new ImageResponse(
        (
            <div
                style={{
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    fontFamily: 'Inter',
                }}
            >
                {/* Background - Cover Photo or Gradient */}
                {coverPhoto ? (
                    <img
                        src={coverPhoto}
                        alt="Cover"
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }}
                    />
                ) : (
                    <div
                        style={{
                            position: 'absolute',
                            width: '100%',
                            height: '100%',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
                        }}
                    />
                )}

                {/* Dark Overlay */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        background: 'rgba(0, 0, 0, 0.4)',
                    }}
                />

                {/* Content */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 10,
                        padding: '80px',
                    }}
                >
                    {/* Couple Names */}
                    <div
                        style={{
                            fontSize: 80,
                            fontWeight: 700,
                            color: 'white',
                            textAlign: 'center',
                            marginBottom: 30,
                            textShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                        }}
                    >
                        <span>{names[0] || 'Tên 1'}</span>
                        <span style={{ color: '#ff6b9d' }}>❤️</span>
                        <span>{names[1] || 'Tên 2'}</span>
                    </div>

                    {/* Days Count */}
                    {daysCount > 0 && (
                        <div
                            style={{
                                fontSize: 40,
                                fontWeight: 400,
                                color: 'white',
                                textAlign: 'center',
                                opacity: 0.95,
                                textShadow: '0 2px 8px rgba(0,0,0,0.3)',
                                background: 'rgba(255, 255, 255, 0.1)',
                                padding: '16px 40px',
                                borderRadius: 50,
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(255, 255, 255, 0.2)',
                            }}
                        >
                            Bên nhau {daysCount.toLocaleString('vi-VN')} ngày
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        color: 'white',
                        fontSize: 28,
                        opacity: 0.9,
                        textShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                >
                    <span style={{ fontSize: 32 }}>💝</span>
                    <span>Made with Kỷ Niệm Số</span>
                </div>
            </div>
        ),
        {
            ...size,
            fonts: [
                {
                    name: 'Inter',
                    data: fontDataBold,
                    style: 'normal',
                    weight: 700,
                },
                {
                    name: 'Inter',
                    data: fontDataRegular,
                    style: 'normal',
                    weight: 400,
                },
            ],
        }
    );
}
