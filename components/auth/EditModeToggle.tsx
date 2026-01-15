'use client';

import { motion } from 'framer-motion';
import { Edit3, LogOut } from 'lucide-react';

interface EditModeToggleProps {
    viewMode: 'guest' | 'owner';
    onEditClick: () => void;
    onLogout: () => void;
}

export default function EditModeToggle({ viewMode, onEditClick, onLogout }: EditModeToggleProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-[90px] right-4 z-50 flex flex-col gap-3"
        >
            {viewMode === 'guest' ? (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onEditClick}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                    <Edit3 className="w-5 h-5" />
                    <span>Chế độ Chỉnh sửa</span>
                </motion.button>
            ) : (
                <div className="flex flex-col gap-3">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-full shadow-lg text-center"
                    >
                        ✓ Chế độ Chỉnh sửa
                    </motion.div>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onLogout}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Thoát</span>
                    </motion.button>
                </div>
            )}
        </motion.div>
    );
}
