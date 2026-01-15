'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { createClient } from '@/lib/supabase/client';

interface BackupButtonProps {
    linkId: string;
}

export default function BackupButton({ linkId }: BackupButtonProps) {
    const [isDownloading, setIsDownloading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusText, setStatusText] = useState('');
    const supabase = createClient();

    const downloadBackup = async () => {
        setIsDownloading(true);
        setProgress(0);
        setStatusText('Đang chuẩn bị...');

        try {
            const zip = new JSZip();

            // Step 1: Fetch all data from Supabase
            setStatusText('Đang tải dữ liệu...');
            setProgress(10);

            const [memoriesData, galleryData, messagesData, gamesData] = await Promise.all([
                supabase.from('memories').select('*').eq('link_id', linkId),
                supabase.from('gallery').select('*').eq('link_id', linkId),
                supabase.from('messages').select('*').eq('link_id', linkId),
                supabase.from('games').select('*').eq('link_id', linkId),
            ]);

            const memories = memoriesData.data || [];
            const gallery = galleryData.data || [];
            const messages = messagesData.data || [];
            const games = gamesData.data || [];

            setProgress(20);

            // Step 2: Create memories.json
            setStatusText('Đang tạo file dữ liệu...');
            const memoriesJson = {
                memories: memories.map(m => ({
                    title: m.title,
                    date: m.event_date,
                    description: m.description,
                    created_at: m.created_at,
                })),
                games: games.map(g => ({
                    question: g.question,
                    answer: g.answer,
                    category: g.category,
                })),
                exported_at: new Date().toISOString(),
            };

            zip.file('memories.json', JSON.stringify(memoriesJson, null, 2));
            setProgress(30);

            // Step 3: Create letters.txt
            if (messages.length > 0) {
                let lettersText = '===== THỜI KHÓA BIỂU =====\n\n';
                messages
                    .sort((a, b) => new Date(a.open_at).getTime() - new Date(b.open_at).getTime())
                    .forEach((msg, index) => {
                        lettersText += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
                        lettersText += `Thư #${index + 1}\n`;
                        lettersText += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
                        lettersText += `Tiêu đề: ${msg.title || 'Không có tiêu đề'}\n`;
                        lettersText += `Ngày mở: ${new Date(msg.open_at).toLocaleDateString('vi-VN')}\n`;
                        lettersText += `Đã mở: ${msg.is_opened ? 'Có' : 'Chưa'}\n\n`;
                        lettersText += `Nội dung:\n${msg.content}\n`;
                    });
                zip.file('letters.txt', lettersText);
            }
            setProgress(40);

            // Step 4: Download all images
            const allImages = [
                ...memories.filter(m => m.image_url).map(m => ({
                    url: m.image_url!,
                    name: `memory_${m.id}.jpg`,
                })),
                ...gallery.map((g, i) => ({
                    url: g.image_url,
                    name: `gallery_${i + 1}.jpg`,
                })),
            ];

            if (allImages.length > 0) {
                setStatusText('Đang tải ảnh...');
                const photosFolder = zip.folder('photos');

                for (let i = 0; i < allImages.length; i++) {
                    const { url, name } = allImages[i];

                    try {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        photosFolder?.file(name, blob);

                        // Update progress (40% to 90%)
                        const imageProgress = 40 + ((i + 1) / allImages.length) * 50;
                        setProgress(Math.round(imageProgress));
                    } catch (error) {
                        console.error(`Failed to download image: ${url}`, error);
                    }
                }
            }

            setStatusText('Đang nén file...');
            setProgress(95);

            // Step 5: Generate ZIP file
            const zipBlob = await zip.generateAsync({ type: 'blob' });

            setStatusText('Hoàn tất!');
            setProgress(100);

            // Step 6: Download
            const username = 'backup'; // Could fetch from link data
            const timestamp = new Date().toISOString().split('T')[0];
            saveAs(zipBlob, `ky-niem-so-${timestamp}.zip`);

            setTimeout(() => {
                setIsDownloading(false);
                setProgress(0);
                setStatusText('');
            }, 1500);

        } catch (error) {
            console.error('Backup error:', error);
            alert('Có lỗi xảy ra khi tạo backup. Vui lòng thử lại.');
            setIsDownloading(false);
            setProgress(0);
            setStatusText('');
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                    Backup Dữ Liệu
                </h3>
            </div>

            <p className="text-sm text-gray-600">
                Tải về tất cả kỷ niệm, ảnh, và tin nhắn của bạn dưới dạng file ZIP.
                Dữ liệu thuộc về bạn! 🔒
            </p>

            <button
                onClick={downloadBackup}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isDownloading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{statusText || 'Đang tải...'}</span>
                    </>
                ) : (
                    <>
                        <Download className="w-5 h-5" />
                        <span>Tải Backup (.zip)</span>
                    </>
                )}
            </button>

            {/* Progress Bar */}
            {isDownloading && (
                <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-green-500 to-teal-500 h-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                        {progress}% - {statusText}
                    </p>
                </div>
            )}
        </div>
    );
}
