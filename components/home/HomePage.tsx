'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TapToOpenOverlay from './TapToOpenOverlay';
import MusicPlayer, { MusicPlayerRef } from './MusicPlayer';
import DaysCounter from './DaysCounter';
import MasonryGallery from './MasonryGallery';
import TimeCapsule from '../modules/TimeCapsule';
import FlashcardGame from '../modules/FlashcardGame';
import SettingsModal from '../settings/SettingsModal';
import Timeline from './Timeline';
import BottomNavigationBar, { TabType } from './BottomNavigationBar';
import FloatingDock from './FloatingDock';
import EditProfileModal from './EditProfileModal';
import OwnerPinModal from '../auth/OwnerPinModal';
import { useVisitorLogger } from '@/hooks/useVisitorLogger';
import { useAuthStore } from '@/store/useAuthStore';
import { Edit3 } from 'lucide-react';
import type { LinkSettings } from '@/types/database.types';

interface HomePageProps {
    linkId: string;
    username: string;
    settings: LinkSettings;
}

export default function HomePage({ linkId, username, settings }: HomePageProps) {
    const [isOpened, setIsOpened] = useState(false);
    const [activeTab, setActiveTab] = useState<TabType>('home');
    const [showEditProfile, setShowEditProfile] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const { viewMode, logout, setOwnerAuth } = useAuthStore();
    const musicPlayerRef = useRef<MusicPlayerRef>(null);

    const isOwner = viewMode === 'owner';

    // Log unique visitor (once per browser session)
    useVisitorLogger(linkId);

    const names = settings.names || ['', ''];
    const anniversaryDate = settings.anniversary_date || new Date().toISOString();
    const shortNote = settings.short_note || '';
    const musicVideoId = (settings as any).music_video_id || 'dQw4w9WgXcQ';

    const handleOpen = () => {
        setIsOpened(true);
    };

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
    };

    const handleMusicToggle = () => {
        musicPlayerRef.current?.togglePlay();
        setIsPlaying(musicPlayerRef.current?.getIsPlaying() || false);
    };

    // Update isPlaying state periodically
    useState(() => {
        const interval = setInterval(() => {
            setIsPlaying(musicPlayerRef.current?.getIsPlaying() || false);
        }, 1000);
        return () => clearInterval(interval);
    });

    // Render content based on active tab
    const renderTabContent = () => {
        switch (activeTab) {
            case 'home':
                return (
                    <div className="space-y-8">
                        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
                            <Timeline linkId={linkId} />
                        </div>
                    </div>
                );

            case 'gallery':
                return (
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
                        <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">
                            📸 Kho Ảnh
                        </h2>
                        <MasonryGallery linkId={linkId} />
                    </div>
                );

            case 'fun':
                return (
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
                        <FlashcardGame linkId={linkId} />
                    </div>
                );

            case 'capsule':
                return (
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12">
                        <TimeCapsule linkId={linkId} />
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <>
            {/* Tap to Open Overlay */}
            {!isOpened && <TapToOpenOverlay onOpen={handleOpen} />}

            {/* Main Content */}
            {isOpened && (
                <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pb-20">
                    {/* Hidden Music Player */}
                    <MusicPlayer ref={musicPlayerRef} videoId={musicVideoId} />

                    {/* Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="relative min-h-[40vh] flex items-center justify-center overflow-hidden mb-8"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-500 opacity-90" />

                        <div className="absolute inset-0 opacity-10">
                            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                <pattern id="hearts" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                                    <text x="50" y="50" fontSize="40" textAnchor="middle" fill="white">❤</text>
                                </pattern>
                                <rect x="0" y="0" width="100%" height="100%" fill="url(#hearts)" />
                            </svg>
                        </div>

                        <div className="relative z-10 text-center px-4 py-12">
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="relative"
                            >
                                {isOwner && (
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => setShowEditProfile(true)}
                                        className="absolute -top-2 right-4 md:right-auto md:left-[calc(50%+200px)] p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full shadow-lg transition-all"
                                        title="Chỉnh sửa thông tin"
                                    >
                                        <Edit3 className="w-5 h-5 text-white" />
                                    </motion.button>
                                )}

                                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                                    {names[0]} ❤️ {names[1]}
                                </h1>
                                {shortNote && (
                                    <p className="text-lg md:text-xl text-white/90 mb-6 italic">
                                        {shortNote}
                                    </p>
                                )}
                                <DaysCounter anniversaryDate={anniversaryDate} />
                            </motion.div>
                        </div>
                    </motion.div>

                    {/* Tabbed Content Area */}
                    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-32">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {renderTabContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom Navigation */}
                    <BottomNavigationBar activeTab={activeTab} onTabChange={handleTabChange} />

                    {/* Floating Dock - Unified Control Center */}
                    <FloatingDock
                        isOwner={isOwner}
                        isPlaying={isPlaying}
                        onLoginClick={() => setShowLoginModal(true)}
                        onSettingsClick={() => setShowSettings(true)}
                        onMusicToggle={handleMusicToggle}
                        onHeartClick={() => { }}
                        onAddClick={activeTab === 'home' && isOwner ? () => {/* Open add memory modal */ } : undefined}
                        onLogoutClick={() => logout()}
                    />

                    {/* Settings Modal */}
                    <SettingsModal
                        isOpen={showSettings}
                        onClose={() => setShowSettings(false)}
                        linkId={linkId}
                        currentThemeColor={(settings as any).theme_color}
                        currentMusicVideoId={musicVideoId}
                    />

                    {/* Edit Profile Modal */}
                    <EditProfileModal
                        isOpen={showEditProfile}
                        onClose={() => setShowEditProfile(false)}
                        linkId={linkId}
                        currentNames={names}
                        currentDate={anniversaryDate}
                    />

                    {/* Owner PIN Modal */}
                    <OwnerPinModal
                        username={username}
                        isOpen={showLoginModal}
                        onClose={() => setShowLoginModal(false)}
                        onSuccess={(linkId) => {
                            setOwnerAuth(linkId, username);
                            setShowLoginModal(false);
                        }}
                    />
                </div>
            )}
        </>
    );
}
