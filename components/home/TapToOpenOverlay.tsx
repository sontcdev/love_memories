'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Volume2 } from 'lucide-react';

interface TapToOpenOverlayProps {
    onOpen: () => void;
}

export default function TapToOpenOverlay({ onOpen }: TapToOpenOverlayProps) {
    const [isVisible, setIsVisible] = useState(true);

    const handleTap = () => {
        setIsVisible(false);
        // Small delay to ensure animation completes before calling onOpen
        setTimeout(onOpen, 800);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
                    style={{
                        background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.95) 0%, rgba(147, 51, 234, 0.95) 100%)',
                        backdropFilter: 'blur(20px)',
                    }}
                    onClick={handleTap}
                >
                    {/* Animated background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl"
                            animate={{
                                scale: [1, 1.3, 1],
                                opacity: [0.3, 0.5, 0.3],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                        <motion.div
                            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl"
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.5, 0.3, 0.5],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>

                    {/* Main content */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="relative text-center px-6"
                    >
                        {/* Pulsing heart icon */}
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="inline-block mb-6"
                        >
                            <div className="relative">
                                <Heart className="w-24 h-24 text-white" fill="white" />
                                {/* Sound waves */}
                                <motion.div
                                    className="absolute -right-2 top-1/2 -translate-y-1/2"
                                    animate={{
                                        opacity: [0.5, 1, 0.5],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        ease: "easeInOut",
                                    }}
                                >
                                    <Volume2 className="w-8 h-8 text-white" />
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Text */}
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-5xl md:text-6xl font-bold text-white mb-4"
                        >
                            Chạm để mở
                        </motion.h1>

                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-xl text-white/90 mb-8"
                        >
                            Kỷ niệm của chúng mình đang chờ bạn 💕
                        </motion.p>

                        {/* Animated tap indicator */}
                        <motion.div
                            animate={{
                                y: [0, 10, 0],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                            className="inline-block"
                        >
                            <div className="w-16 h-16 rounded-full border-4 border-white/50 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-white" />
                            </div>
                        </motion.div>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-white/70 text-sm mt-6"
                        >
                            Chạm vào bất kỳ đâu để tiếp tục
                        </motion.p>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
