"use client";

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";

interface MusicPlayerProps {
    src: string | null | undefined;
    autoPlay?: boolean;
}

export interface MusicPlayerRef {
    play: () => void;
    pause: () => void;
    toggle: () => void;
}

// Extract YouTube video ID from various URL formats
function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // Just the ID
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

// Check if URL is YouTube
function isYouTubeUrl(url: string): boolean {
    return url.includes("youtube.com") || url.includes("youtu.be");
}

export const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(
    function MusicPlayer({ src, autoPlay }, ref) {
        const audioRef = useRef<HTMLAudioElement>(null);
        const [isPlaying, setIsPlaying] = useState(false);
        const [isMuted, setIsMuted] = useState(false);
        const [isYouTube, setIsYouTube] = useState(false);
        const [youtubeId, setYoutubeId] = useState<string | null>(null);

        // Detect source type
        useEffect(() => {
            if (src) {
                const ytId = isYouTubeUrl(src) ? getYouTubeId(src) : null;
                setIsYouTube(!!ytId);
                setYoutubeId(ytId);
            }
        }, [src]);

        // YouTube Player API
        useEffect(() => {
            if (!isYouTube || !youtubeId) return;

            // Load YouTube IFrame API
            if (!(window as unknown as { YT?: unknown }).YT) {
                const tag = document.createElement("script");
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName("script")[0];
                firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            }

            // Initialize player when API is ready
            const initPlayer = () => {
                const YT = (window as unknown as { YT: { Player: new (id: string, config: unknown) => unknown } }).YT;
                if (YT && YT.Player) {
                    new YT.Player("youtube-player", {
                        height: "0",
                        width: "0",
                        videoId: youtubeId,
                        playerVars: {
                            autoplay: autoPlay ? 1 : 0,
                            loop: 1,
                            playlist: youtubeId, // Required for loop
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            modestbranding: 1,
                            rel: 0,
                        },
                        events: {
                            onReady: (event: { target: { playVideo: () => void; setVolume: (v: number) => void } }) => {
                                (window as unknown as { ytPlayer: unknown }).ytPlayer = event.target;
                                if (autoPlay) {
                                    event.target.playVideo();
                                    setIsPlaying(true);
                                }
                            },
                            onStateChange: (event: { data: number }) => {
                                // 1 = playing, 2 = paused
                                setIsPlaying(event.data === 1);
                            },
                        },
                    });
                }
            };

            // Check if API is already loaded
            if ((window as unknown as { YT?: { Player?: unknown } }).YT?.Player) {
                initPlayer();
            } else {
                (window as unknown as { onYouTubeIframeAPIReady: () => void }).onYouTubeIframeAPIReady = initPlayer;
            }
        }, [isYouTube, youtubeId, autoPlay]);

        // Expose methods to parent
        useImperativeHandle(ref, () => ({
            play: () => {
                if (isYouTube) {
                    const ytPlayer = (window as unknown as { ytPlayer?: { playVideo: () => void } }).ytPlayer;
                    ytPlayer?.playVideo();
                } else if (audioRef.current && src) {
                    audioRef.current.play().catch(console.error);
                }
            },
            pause: () => {
                if (isYouTube) {
                    const ytPlayer = (window as unknown as { ytPlayer?: { pauseVideo: () => void } }).ytPlayer;
                    ytPlayer?.pauseVideo();
                } else if (audioRef.current) {
                    audioRef.current.pause();
                }
            },
            toggle: () => {
                if (isYouTube) {
                    const ytPlayer = (window as unknown as { ytPlayer?: { playVideo: () => void; pauseVideo: () => void } }).ytPlayer;
                    if (isPlaying) {
                        ytPlayer?.pauseVideo();
                    } else {
                        ytPlayer?.playVideo();
                    }
                } else if (audioRef.current) {
                    if (isPlaying) {
                        audioRef.current.pause();
                    } else {
                        audioRef.current.play().catch(console.error);
                    }
                }
            },
        }));

        // Audio event handlers (for non-YouTube)
        useEffect(() => {
            if (isYouTube) return;

            const audio = audioRef.current;
            if (!audio) return;

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            audio.addEventListener("play", handlePlay);
            audio.addEventListener("pause", handlePause);

            return () => {
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("pause", handlePause);
            };
        }, [isYouTube]);

        const toggleMute = () => {
            if (isYouTube) {
                const ytPlayer = (window as unknown as { ytPlayer?: { mute: () => void; unMute: () => void } }).ytPlayer;
                if (isMuted) {
                    ytPlayer?.unMute();
                } else {
                    ytPlayer?.mute();
                }
            } else if (audioRef.current) {
                audioRef.current.muted = !isMuted;
            }
            setIsMuted(!isMuted);
        };

        const togglePlay = () => {
            if (isYouTube) {
                const ytPlayer = (window as unknown as { ytPlayer?: { playVideo: () => void; pauseVideo: () => void } }).ytPlayer;
                if (isPlaying) {
                    ytPlayer?.pauseVideo();
                } else {
                    ytPlayer?.playVideo();
                }
            } else if (audioRef.current) {
                if (isPlaying) {
                    audioRef.current.pause();
                } else {
                    audioRef.current.play().catch(console.error);
                }
            }
        };

        // Don't render if no music source
        if (!src) return null;

        return (
            <>
                {/* Hidden YouTube Player */}
                {isYouTube && (
                    <div className="fixed -left-[9999px] -top-[9999px] w-0 h-0 overflow-hidden">
                        <div id="youtube-player" />
                    </div>
                )}

                {/* Hidden Audio Element (for non-YouTube) */}
                {!isYouTube && <audio ref={audioRef} src={src} loop preload="auto" />}

                {/* Floating Music Button */}
                <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
                    {/* Play/Pause Button with Vinyl */}
                    <button
                        onClick={togglePlay}
                        className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${isPlaying ? "animate-spin-slow" : ""
                            }`}
                        title={isPlaying ? "Pause Music" : "Play Music"}
                    >
                        {/* Vinyl Grooves */}
                        <div className="absolute inset-1 rounded-full border border-gray-600 opacity-30" />
                        <div className="absolute inset-2 rounded-full border border-gray-600 opacity-30" />
                        <div className="absolute inset-3 rounded-full border border-gray-600 opacity-30" />

                        {/* Center - Play/Pause Icon */}
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                            {isPlaying ? (
                                <Pause className="w-3 h-3 text-white fill-white" />
                            ) : (
                                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            )}
                        </div>
                    </button>

                    {/* Mute Button */}
                    <button
                        onClick={toggleMute}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${isMuted
                            ? "bg-gray-200 text-gray-500"
                            : "bg-white text-gray-700 hover:bg-gray-50"
                            }`}
                        title={isMuted ? "Unmute" : "Mute"}
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                        ) : (
                            <Volume2 className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Slow Spin Animation */}
                <style jsx>{`
          @keyframes spin-slow {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin-slow {
            animation: spin-slow 3s linear infinite;
          }
        `}</style>
            </>
        );
    }
);
