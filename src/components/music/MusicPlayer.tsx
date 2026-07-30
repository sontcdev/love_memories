"use client";

import { useRef, useState, useEffect, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { Volume2, VolumeX, Play, Pause, Music, X } from "lucide-react";

interface MusicPlayerProps {
    src: string | null | undefined;
    autoPlay?: boolean;
}

export interface MusicPlayerRef {
    play: () => void;
    pause: () => void;
    toggle: () => void;
}

/* ------------------------------------------------------------------ *
 * Source resolution
 * ------------------------------------------------------------------ */

type ResolvedSource =
    | { kind: "youtube"; id: string }
    | { kind: "tiktok"; id: string }
    | { kind: "audio"; url: string };

function getYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([^&\n?#]+)/,
        /^([a-zA-Z0-9_-]{11})$/, // bare video id
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
    }
    return null;
}

function getTikTokId(url: string): string | null {
    const match = url.match(/tiktok\.com\/(?:@[^/]+\/video|v|embed(?:\/v2)?)\/(\d+)/);
    return match ? match[1] : null;
}

function resolveSource(src: string): ResolvedSource {
    const url = src.trim();

    const youtubeId = getYouTubeId(url);
    if (youtubeId) return { kind: "youtube", id: youtubeId };

    const tiktokId = getTikTokId(url);
    if (tiktokId) return { kind: "tiktok", id: tiktokId };

    return { kind: "audio", url };
}

/* ------------------------------------------------------------------ *
 * YouTube IFrame API loader
 *
 * Shared module-level promise so several mounts (or a remount) reuse a
 * single script load instead of racing on `onYouTubeIframeAPIReady`.
 * ------------------------------------------------------------------ */

type YTPlayer = {
    playVideo: () => void;
    pauseVideo: () => void;
    mute: () => void;
    unMute: () => void;
    setVolume: (volume: number) => void;
    destroy: () => void;
};

type YTNamespace = {
    Player: new (element: HTMLElement | string, config: unknown) => YTPlayer;
};

declare global {
    interface Window {
        YT?: YTNamespace;
        onYouTubeIframeAPIReady?: () => void;
    }
}

let ytApiPromise: Promise<YTNamespace> | null = null;

function loadYouTubeApi(): Promise<YTNamespace> {
    if (typeof window === "undefined") {
        return Promise.reject(new Error("YouTube API unavailable during SSR"));
    }
    if (window.YT?.Player) return Promise.resolve(window.YT);
    if (ytApiPromise) return ytApiPromise;

    ytApiPromise = new Promise<YTNamespace>((resolve, reject) => {
        const previousCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            previousCallback?.();
            if (window.YT?.Player) resolve(window.YT);
            else reject(new Error("YouTube API ready without Player"));
        };

        const alreadyRequested = document.querySelector<HTMLScriptElement>(
            'script[src*="youtube.com/iframe_api"]'
        );
        if (!alreadyRequested) {
            const tag = document.createElement("script");
            tag.src = "https://www.youtube.com/iframe_api";
            tag.async = true;
            tag.onerror = () => reject(new Error("Failed to load YouTube IFrame API"));
            document.head.appendChild(tag);
        }
    });

    // Allow a later retry if this attempt fails (offline, blocked, etc.).
    ytApiPromise.catch(() => {
        ytApiPromise = null;
    });

    return ytApiPromise;
}

/* ------------------------------------------------------------------ */

export const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(
    function MusicPlayer({ src, autoPlay = false }, ref) {
        const source = useMemo(() => (src ? resolveSource(src) : null), [src]);

        const audioRef = useRef<HTMLAudioElement>(null);
        const ytHostRef = useRef<HTMLDivElement>(null);
        const ytPlayerRef = useRef<YTPlayer | null>(null);

        const [isPlaying, setIsPlaying] = useState(false);
        const [isMuted, setIsMuted] = useState(false);
        const [isTikTokOpen, setIsTikTokOpen] = useState(false);
        const [tikTokNeedsTap, setTikTokNeedsTap] = useState(false);

        // `play()` can arrive from the WelcomeOverlay tap before the YouTube
        // player finishes loading. Remember the request and flush it onReady —
        // without this the promised music silently never starts.
        const pendingPlayRef = useRef(false);
        const autoPlayRef = useRef(autoPlay);
        const isPlayingRef = useRef(false);

        useEffect(() => {
            autoPlayRef.current = autoPlay;
        }, [autoPlay]);

        useEffect(() => {
            isPlayingRef.current = isPlaying;
        }, [isPlaying]);

        // Attempt unmuted playback, then fall back to muted playback.
        // Browsers block unmuted programmatic play outside a user gesture, so a
        // muted retry keeps the track running and the mute button becomes the
        // "tap to unmute" affordance.
        const startYouTube = useCallback((player: YTPlayer) => {
            try {
                player.unMute();
                player.playVideo();
            } catch {
                return;
            }

            window.setTimeout(() => {
                if (ytPlayerRef.current !== player) return;
                if (isPlayingRef.current) return;
                try {
                    player.mute();
                    setIsMuted(true);
                    player.playVideo();
                } catch {
                    /* nothing else to try */
                }
            }, 1200);
        }, []);

        /* ---------- YouTube player lifecycle ---------- */
        useEffect(() => {
            if (source?.kind !== "youtube") return;
            const host = ytHostRef.current;
            if (!host) return;

            let cancelled = false;

            // YT.Player REPLACES the element it is handed with an iframe, so give
            // it a throwaway child. Passing the ref'd host directly meant a second
            // effect run (React StrictMode, prop change) found no element and
            // failed silently — the original playback bug.
            const mountPoint = document.createElement("div");
            host.appendChild(mountPoint);

            loadYouTubeApi()
                .then((YT) => {
                    if (cancelled) return;

                    const player: YTPlayer = new YT.Player(mountPoint, {
                        height: "0",
                        width: "0",
                        videoId: source.id,
                        playerVars: {
                            // Autoplay is driven from onReady instead of playerVars so
                            // it can honour the WelcomeOverlay gesture and degrade to
                            // muted playback when the browser blocks it.
                            autoplay: 0,
                            loop: 1,
                            playlist: source.id, // required for loop to work
                            controls: 0,
                            disablekb: 1,
                            fs: 0,
                            modestbranding: 1,
                            rel: 0,
                            playsinline: 1,
                        },
                        events: {
                            onReady: () => {
                                if (cancelled) {
                                    try {
                                        player.destroy();
                                    } catch {
                                        /* already gone */
                                    }
                                    return;
                                }
                                ytPlayerRef.current = player;
                                if (pendingPlayRef.current || autoPlayRef.current) {
                                    pendingPlayRef.current = false;
                                    startYouTube(player);
                                }
                            },
                            onStateChange: (event: { data: number }) => {
                                // 1 = playing, 2 = paused
                                setIsPlaying(event.data === 1);
                            },
                            onError: () => setIsPlaying(false),
                        },
                    });
                })
                .catch(() => {
                    /* API unavailable — the floating button still allows a retry */
                });

            return () => {
                cancelled = true;
                try {
                    ytPlayerRef.current?.destroy();
                } catch {
                    /* already destroyed */
                }
                ytPlayerRef.current = null;
                host.replaceChildren();
                setIsPlaying(false);
            };
        }, [source, startYouTube]);

        /* ---------- pause-music events (VoiceRecorder, letter audio) ---------- */
        useEffect(() => {
            const handlePauseMusic = () => {
                ytPlayerRef.current?.pauseVideo();
                audioRef.current?.pause();
                setIsTikTokOpen(false);
                setIsPlaying(false);
            };

            window.addEventListener("pause-music", handlePauseMusic);
            return () => window.removeEventListener("pause-music", handlePauseMusic);
        }, []);

        /* ---------- imperative API ---------- */
        useImperativeHandle(
            ref,
            () => ({
                play: () => {
                    if (!source) return;

                    if (source.kind === "youtube") {
                        const player = ytPlayerRef.current;
                        if (player) startYouTube(player);
                        else pendingPlayRef.current = true;
                        return;
                    }

                    if (source.kind === "tiktok") {
                        // TikTok exposes no programmatic play API on its embed, so
                        // this source degrades to tap-to-play instead of disabling
                        // music everywhere.
                        setTikTokNeedsTap(true);
                        return;
                    }

                    audioRef.current?.play().catch(() => {
                        /* blocked by autoplay policy — the button remains available */
                    });
                },
                pause: () => {
                    ytPlayerRef.current?.pauseVideo();
                    audioRef.current?.pause();
                    if (source?.kind === "tiktok") setIsTikTokOpen(false);
                },
                toggle: () => {
                    if (isPlayingRef.current) {
                        ytPlayerRef.current?.pauseVideo();
                        audioRef.current?.pause();
                        return;
                    }
                    if (source?.kind === "youtube") {
                        const player = ytPlayerRef.current;
                        if (player) startYouTube(player);
                        else pendingPlayRef.current = true;
                        return;
                    }
                    if (source?.kind === "tiktok") {
                        setIsTikTokOpen((open) => !open);
                        return;
                    }
                    audioRef.current?.play().catch(() => { });
                },
            }),
            [source, startYouTube]
        );

        /* ---------- <audio> element state sync ---------- */
        useEffect(() => {
            if (source?.kind !== "audio") return;
            const audio = audioRef.current;
            if (!audio) return;

            const handlePlay = () => setIsPlaying(true);
            const handlePause = () => setIsPlaying(false);

            audio.addEventListener("play", handlePlay);
            audio.addEventListener("pause", handlePause);
            audio.addEventListener("ended", handlePause);

            return () => {
                audio.removeEventListener("play", handlePlay);
                audio.removeEventListener("pause", handlePause);
                audio.removeEventListener("ended", handlePause);
            };
        }, [source]);

        const toggleMute = () => {
            const next = !isMuted;
            if (ytPlayerRef.current) {
                if (next) ytPlayerRef.current.mute();
                else ytPlayerRef.current.unMute();
            }
            if (audioRef.current) audioRef.current.muted = next;
            setIsMuted(next);
        };

        const togglePlay = () => {
            if (source?.kind === "tiktok") {
                setTikTokNeedsTap(false);
                setIsTikTokOpen((open) => !open);
                return;
            }
            if (isPlaying) {
                ytPlayerRef.current?.pauseVideo();
                audioRef.current?.pause();
                return;
            }
            if (source?.kind === "youtube") {
                const player = ytPlayerRef.current;
                if (player) startYouTube(player);
                else pendingPlayRef.current = true;
                return;
            }
            audioRef.current?.play().catch(() => { });
        };

        if (!source) return null;

        const isTikTok = source.kind === "tiktok";
        const showAsPlaying = isTikTok ? isTikTokOpen : isPlaying;

        return (
            <>
                {/* Hidden YouTube player host (kept mounted; the API replaces a child) */}
                {source.kind === "youtube" && (
                    <div
                        ref={ytHostRef}
                        aria-hidden="true"
                        className="fixed -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden"
                    />
                )}

                {source.kind === "audio" && (
                    <audio ref={audioRef} src={source.url} loop preload="auto" />
                )}

                {/* TikTok tap-to-play panel */}
                {isTikTok && isTikTokOpen && (
                    <div className="fixed bottom-24 right-6 z-40 w-[280px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-3 py-2">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                                <Music className="h-3.5 w-3.5" /> Nhạc nền
                            </span>
                            <button
                                onClick={() => setIsTikTokOpen(false)}
                                className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                                aria-label="Đóng trình phát nhạc"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <iframe
                            src={`https://www.tiktok.com/embed/v2/${source.id}`}
                            title="Nhạc nền TikTok"
                            className="h-[320px] w-full border-0"
                            allow="autoplay; encrypted-media; picture-in-picture"
                        />
                        <p className="px-3 py-2 text-[11px] leading-snug text-gray-500">
                            TikTok không cho phép tự động phát. Nhấn play trong khung trên để
                            bật nhạc.
                        </p>
                    </div>
                )}

                {/* Floating controls */}
                <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
                    <button
                        onClick={togglePlay}
                        className={`relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl transition-transform hover:scale-105 ${showAsPlaying ? "animate-spin-slow" : ""
                            } ${tikTokNeedsTap && !isTikTokOpen ? "animate-pulse-ring" : ""}`}
                        title={
                            isTikTok
                                ? isTikTokOpen
                                    ? "Đóng trình phát nhạc"
                                    : "Mở trình phát nhạc"
                                : isPlaying
                                    ? "Tạm dừng"
                                    : "Phát nhạc"
                        }
                        aria-label={
                            isTikTok
                                ? isTikTokOpen
                                    ? "Đóng trình phát nhạc"
                                    : "Mở trình phát nhạc"
                                : isPlaying
                                    ? "Tạm dừng nhạc"
                                    : "Phát nhạc"
                        }
                    >
                        {/* Vinyl grooves */}
                        <div className="absolute inset-1 rounded-full border border-gray-600 opacity-30" />
                        <div className="absolute inset-2 rounded-full border border-gray-600 opacity-30" />
                        <div className="absolute inset-3 rounded-full border border-gray-600 opacity-30" />

                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-pink-500">
                            {isTikTok ? (
                                <Music className="h-3 w-3 fill-white text-white" />
                            ) : isPlaying ? (
                                <Pause className="h-3 w-3 fill-white text-white" />
                            ) : (
                                <Play className="ml-0.5 h-3 w-3 fill-white text-white" />
                            )}
                        </div>
                    </button>

                    {!isTikTok && (
                        <button
                            onClick={toggleMute}
                            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all ${isMuted
                                ? "bg-gray-200 text-gray-500"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                                }`}
                            title={isMuted ? "Bật âm" : "Tắt âm"}
                            aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                        >
                            {isMuted ? (
                                <VolumeX className="h-5 w-5" />
                            ) : (
                                <Volume2 className="h-5 w-5" />
                            )}
                        </button>
                    )}
                </div>
            </>
        );
    }
);
