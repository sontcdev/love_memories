'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import TimelineSection from './TimelineSection';
import AddMemoryModal from './AddMemoryModal';
import { useAuthStore } from '@/store/useAuthStore';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Memory {
    id: string;
    event_date: string;
    title: string;
    description: string | null;
    image_url: string | null;
}

interface TimelineProps {
    linkId: string;
}

export default function Timeline({ linkId }: TimelineProps) {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { viewMode } = useAuthStore();
    const router = useRouter();
    const supabase = createClient();

    const isOwner = viewMode === 'owner';

    const fetchMemories = async () => {
        try {
            const { data, error } = await supabase
                .from('memories')
                .select('*')
                .eq('link_id', linkId)
                .order('event_date', { ascending: false });

            if (error) throw error;
            setMemories(data || []);
        } catch (error) {
            console.error('Error fetching memories:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemories();
    }, [linkId]);

    const handleSuccess = () => {
        router.refresh();
        fetchMemories();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
            >
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    🕰️ Dòng Thời Gian
                </h2>
                <p className="text-gray-600">Những khoảnh khắc đáng nhớ của chúng ta</p>
            </motion.div>

            {/* Add Memory Button (Owner only) */}
            {isOwner && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6 text-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Thêm Kỷ Niệm</span>
                    </motion.button>
                </motion.div>
            )}

            {/* Timeline */}
            <TimelineSection
                memories={memories}
                onAddClick={isOwner ? () => setIsModalOpen(true) : undefined}
            />

            {/* Add Memory Modal */}
            <AddMemoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                linkId={linkId}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
