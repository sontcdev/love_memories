'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Music, Heart, Plus, LogOut, Play, Pause, Edit3 } from 'lucide-react';

interface FloatingDockProps {
    isOwner: boolean;
    isPlaying: boolean;
    onLoginClick: () => void;
    onSettingsClick: () => void;
    onMusicToggle: () => void;
    onHeartClick: () => void;
    onAddClick?: () => void;
    onLogoutClick: () => void;
}

export default function FloatingDock({
    isOwner,
    isPlaying,
    onLoginClick,
    onSettingsClick,
    onMusicToggle,
    onHeartClick,
    onAddClick,
    onLogoutClick
}: FloatingDockProps) {
    const [hearts, setHearts] = useState<Array<{ id: number; x: number; delay: number }>>([]);
    const [nextId, setNextId] = useState(0);

    const spawnHearts = () => {
        onHeartClick();

        // Create 5 hearts
        const count = 5;
        const newHearts: Array<{ id: number; x: number; delay: number }> = [];

        for (let i = 0; i < count; i++) {
            newHearts.push({
                id: nextId + i,
                x: Math.random() * 60 - 30,
                delay: i * 0.1,
            });
        }

        setHearts((prev) => [...prev, ...newHearts]);
        setNextId((prev) => prev + count);

        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
        }, 3000);
    };

    return (
        <>
            {/* Floating Dock */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
            >
                <div className="flex items-center gap-2 px-4 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white/20">
                    {/* Guest Mode: Login/Edit Icon */}
                    {!isOwner && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onLoginClick}
                                className="p-2.5 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-full transition-colors"
                                title="Edit"
                            >
                                <Edit3 className="w-5 h-5" />
                            </motion.button>
                            <div className="w-px h-6 bg-gray-300" />
                        </>
                    )}

                    {/* Owner Mode: Settings Icon */}
                    {isOwner && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onSettingsClick}
                                className="p-2.5 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-full transition-colors"
                                title="Cài đặt"
                            >
                                <Settings className="w-5 h-5" />
                            </motion.button>
                            <div className="w-px h-6 bg-gray-300" />
                        </>
                    )}

                    {/* Owner Mode: Add Button */}
                    {isOwner && onAddClick && (
                        <>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onAddClick}
                                className="p-2.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                                title="Thêm kỷ niệm"
                            >
                                <Plus className="w-5 h-5" />
                            </motion.button>
                            <div className="w-px h-6 bg-gray-300" />
                        </>
                    )}

                    {/* Music Play/Pause */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onMusicToggle}
                        className={`p-2.5 rounded-full transition-colors ${isPlaying
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        title={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
                    >
                        {isPlaying ? (
                            <Pause className="w-5 h-5" fill="white" />
                        ) : (
                            <Play className="w-5 h-5" />
                        )}
                    </motion.button>

                    {/* Heart Button */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={spawnHearts}
                        className="p-2.5 bg-pink-100 text-pink-600 rounded-full hover:bg-pink-200 transition-colors"
                        title="Gửi trái tim"
                    >
                        <Heart className="w-5 h-5" />
                    </motion.button>

                    {/* Owner Mode: Logout Button */}
                    {isOwner && (
                        <>
                            <div className="w-px h-6 bg-gray-300" />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onLogoutClick}
                                className="p-2.5 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </motion.button>
                        </>
                    )}
                </div>
            </motion.div>

            {/* Floating Hearts Animation */}
            <AnimatePresence>
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{
                            x: '50vw',
                            y: 'calc(100vh - 120px)',
                            opacity: 1,
                            scale: 0,
                        }}
                        animate={{
                            x: `calc(50vw + ${heart.x}px)`,
                            y: -50,
                            opacity: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                        }}
                        transition={{
                            duration: 2.5,
                            delay: heart.delay,
                            ease: 'easeOut',
                        }}
                        className="fixed pointer-events-none z-50 text-3xl"
                    >
                        ❤️
                    </motion.div>
                ))}
            </AnimatePresence>
        </>
    );
}
