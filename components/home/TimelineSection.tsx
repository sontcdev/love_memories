'use client';

import { motion } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { deleteMemory } from '@/app/actions/memories';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

interface Memory {
    id: string;
    event_date: string;
    title: string;
    description: string | null;
    image_url: string | null;
}

interface TimelineSectionProps {
    memories: Memory[];
    onAddClick?: () => void; // Optional callback for Add button
}

export default function TimelineSection({ memories, onAddClick }: TimelineSectionProps) {
    const { viewMode } = useAuthStore();
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const isOwner = viewMode === 'owner';

    if (!memories || memories.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="text-6xl mb-6">📭</div>

                {isOwner ? (
                    <>
                        <p className="text-gray-600 mb-6 text-lg">Chưa có kỷ niệm nào</p>
                        <p className="text-sm text-gray-500 mb-8">
                            Bắt đầu lưu giữ những khoảnh khắc đáng nhớ của bạn
                        </p>

                        {/* Prominent CTA Button for Owner */}
                        {onAddClick && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onAddClick}
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all"
                            >
                                <span className="text-2xl">+</span>
                                <span>Thêm Kỷ Niệm Đầu Tiên</span>
                            </motion.button>
                        )}
                    </>
                ) : (
                    <p className="text-gray-500">Chưa có kỷ niệm nào được thêm vào timeline</p>
                )}
            </div>
        );
    }

    // Sort memories by date (newest first)
    const sortedMemories = [...memories].sort((a, b) =>
        new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    );

    const handleDelete = async (memoryId: string) => {
        if (!confirm('Bạn có chắc muốn xóa kỷ niệm này?')) return;

        setDeletingId(memoryId);

        try {
            const result = await deleteMemory(memoryId);

            if (result.success) {
                router.refresh();
            } else {
                alert(result.error || 'Không thể xóa kỷ niệm');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Có lỗi xảy ra');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="relative py-8">
            {/* Vertical Line - z-0 to not overlap sticky header/music player */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 via-cyan-300 to-blue-300 transform md:-translate-x-1/2 z-0" />

            {/* Timeline Items */}
            <div className="space-y-12 relative z-10">
                {sortedMemories.map((memory, index) => {
                    const isEven = index % 2 === 0;
                    const formattedDate = new Date(memory.event_date).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });

                    return (
                        <motion.div
                            key={memory.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            className={`relative flex items-center ${isEven
                                ? 'md:flex-row-reverse md:justify-end'
                                : 'md:flex-row md:justify-start'
                                }`}
                        >
                            {/* Timeline Node */}
                            <motion.div
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 + 0.2 }}
                                className="absolute left-4 md:left-1/2 w-4 h-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full border-4 border-white shadow-lg transform md:-translate-x-1/2 z-20"
                            />

                            {/* Content Card */}
                            <div className={`ml-12 md:ml-0 w-full ${isEven
                                ? 'md:pr-8 md:w-1/2 md:text-right'
                                : 'md:pl-8 md:w-1/2'
                                }`}>
                                <motion.div
                                    whileHover={{ scale: 1.02, y: -4 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                    className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden group hover:shadow-2xl transition-shadow relative"
                                >
                                    {/* Delete Button (Owner only) */}
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(memory.id)}
                                            disabled={deletingId === memory.id}
                                            className={`absolute top-4 ${isEven ? 'md:left-4' : 'md:right-4'} right-4 z-30 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg ${deletingId === memory.id ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}

                                    {/* Image - Lazy Loading with Next.js Image */}
                                    {memory.image_url && (
                                        <div className="relative h-48 overflow-hidden">
                                            <Image
                                                src={memory.image_url}
                                                alt={memory.title}
                                                fill
                                                loading="lazy"
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="p-6">
                                        {/* Date Badge */}
                                        <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full text-sm font-medium text-blue-700 mb-3 ${isEven ? 'md:float-right' : ''
                                            }`}>
                                            <Calendar className="w-4 h-4" />
                                            <span>{formattedDate}</span>
                                        </div>

                                        {/* Title */}
                                        <h3 className="text-xl font-bold text-gray-800 mb-2 clear-both">
                                            {memory.title}
                                        </h3>

                                        {/* Description */}
                                        {memory.description && (
                                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                                {memory.description}
                                            </p>
                                        )}
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* End Cap */}
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="absolute left-4 md:left-1/2 bottom-0 w-6 h-6 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full transform md:-translate-x-1/2 shadow-lg z-20"
            />
        </div>
    );
}
