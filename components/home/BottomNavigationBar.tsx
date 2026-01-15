'use client';

import { Heart, Image as ImageIcon, Gamepad2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export type TabType = 'home' | 'gallery' | 'fun' | 'capsule';

interface BottomNavigationBarProps {
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const tabs = [
    { id: 'home' as TabType, label: 'Chuyện Mình', icon: Heart },
    { id: 'gallery' as TabType, label: 'Kho Ảnh', icon: ImageIcon },
    { id: 'fun' as TabType, label: 'Giải Trí', icon: Gamepad2 },
    { id: 'capsule' as TabType, label: 'Hộp Thư', icon: Mail },
];

export default function BottomNavigationBar({ activeTab, onTabChange }: BottomNavigationBarProps) {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 shadow-lg z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-around h-16">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;

                        return (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className="flex flex-col items-center justify-center flex-1 h-full relative"
                            >
                                <motion.div
                                    whileTap={{ scale: 0.9 }}
                                    className="flex flex-col items-center justify-center"
                                >
                                    <Icon
                                        className={`w-6 h-6 mb-1 transition-colors ${isActive
                                                ? 'text-primary-600'
                                                : 'text-gray-400'
                                            }`}
                                    />
                                    <span
                                        className={`text-xs font-medium transition-colors ${isActive
                                                ? 'text-primary-600'
                                                : 'text-gray-500'
                                            }`}
                                    >
                                        {tab.label}
                                    </span>
                                </motion.div>

                                {/* Active Indicator */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
