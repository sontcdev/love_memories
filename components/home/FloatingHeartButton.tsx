'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FloatingHeart {
    id: number;
    x: number;
    size: number;
    duration: number;
    delay: number;
}

export default function FloatingHeartButton() {
    const [hearts, setHearts] = useState<FloatingHeart[]>([]);
    const [nextId, setNextId] = useState(0);

    const spawnHearts = () => {
        // Create 5-8 hearts with random properties
        const count = Math.floor(Math.random() * 4) + 5;
        const newHearts: FloatingHeart[] = [];

        for (let i = 0; i < count; i++) {
            newHearts.push({
                id: nextId + i,
                x: Math.random() * 100 - 50, // Random horizontal offset -50 to 50
                size: Math.random() * 20 + 20, // 20-40px
                duration: Math.random() * 1 + 2, // 2-3 seconds
                delay: i * 0.1, // Stagger the hearts
            });
        }

        setHearts((prev) => [...prev, ...newHearts]);
        setNextId((prev) => prev + count);

        // Clean up hearts after they finish animating
        setTimeout(() => {
            setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
        }, 3500);
    };

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={spawnHearts}
                className="fixed bottom-[90px] right-4 z-50 w-16 h-16 bg-gradient-to-br from-pink-500 to-red-500 rounded-full shadow-2xl flex items-center justify-center group hover:shadow-pink-500/50 transition-shadow"
                aria-label="Send hearts"
            >
                <Heart className="w-8 h-8 text-white fill-white group-hover:scale-110 transition-transform" />
            </motion.button>

            {/* Floating Hearts */}
            <AnimatePresence>
                {hearts.map((heart) => (
                    <motion.div
                        key={heart.id}
                        initial={{
                            x: 'calc(100vw - 96px)', // Start from FAB position
                            y: 'calc(100vh - 96px)',
                            opacity: 1,
                            scale: 0,
                        }}
                        animate={{
                            x: `calc(100vw - 96px + ${heart.x}px)`, // Add wiggle
                            y: -100, // Float up off screen
                            opacity: 0,
                            scale: 1,
                        }}
                        exit={{
                            opacity: 0,
                            scale: 0,
                        }}
                        transition={{
                            duration: heart.duration,
                            delay: heart.delay,
                            ease: 'easeOut',
                            x: {
                                type: 'spring',
                                stiffness: 50,
                                damping: 10,
                            },
                        }}
                        className="fixed pointer-events-none z-50"
                        style={{
                            fontSize: heart.size,
                        }}
                    >
                        <span className="text-pink-500">❤️</span>
                    </motion.div>
                ))}
            </AnimatePresence>
        </>
    );
}
