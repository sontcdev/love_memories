"use client";

import {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useImperativeHandle,
    useCallback,
    useId,
} from "react";
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

// ─── YouTube IFrame API types ──────────────────────────────────────────────
interface YTPlayerOptions {
    videoId: string;
    playerVars?: Record<string, string | number>;
    events?: {
        onReady?: (event: { target: YTPlayer }) => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: (event: { data: number }) => void;
    };
    width?: number | string;
    height?: number | string;
}

interface YTPlayer {
    playVideo(): void;
    pauseVideo(): void;
    mute(): void;
    unMute(): void;
    isMuted(): boolean;
    destroy(): void;
    getPlayerState(): number;
}

declare global {
    interface Window {
        YT?: {
            Player: new (elementId: string | HTMLElement, options: YTPlayerOptions) => YTPlayer;
            PlayerState: { PLAYING: number; PAUSED: number; ENDED: number; BUFFERING: number };
        };
        onYouTubeIframeAPIReady?: () => void;
    }
}
// ──────────────────────────────────────────────────────────────────────────

/** Extract 11-char YouTube video ID from various URL formats */
function getYouTubeId(url: string): string | null {
    try {
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
        const u = new URL(url);
        if (u.hostname.includes("youtube.com")) {
            const v = u.searchParams.get("v");
            if (v) return v;
            // Shorts
            const shorts = u.pathname.match(/\/shorts\/([a-zA-Z0-9_-]{11})/);
            if (shorts) return shorts[1];
        }
        if (u.hostname === "youtu.be") {
            const id = u.pathname.slice(1, 12);
            if (id.length === 11) return id;
        }
    } catch {
        // ignore parse errors
    }
    const patterns = [
        /[?&]v=([a-zA-Z0-9_-]{11})/,
        /youtu\.be\/([a-zA-Z0-9_-]{11})/,
        /youtube(?:-nocookie)?\.com\/embed\/([a-zA-Z0-9_-]{11})/,
        /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
    ];
    for (const p of patterns) {
        const m = url.match(p);
        if (m?.[1]) return m[1];
    }
    return null;
}

/** Singleton: load YouTube IFrame API script once per page */
let ytApiLoaded = false;
let ytApiReady = false;
const ytReadyCallbacks: Array<() => void> = [];
const ytErrorCallbacks: Array<() => void> = [];

function loadYouTubeApi(onReady: () => void, onScriptError?: () => void) {
    if (ytApiReady) {
        onReady();
        return;
    }
    ytReadyCallbacks.push(onReady);
    if (onScriptError) ytErrorCallbacks.push(onScriptError);
    if (ytApiLoaded) return;
    ytApiLoaded = true;

    // Hook global callback BEFORE injecting script
    window.onYouTubeIframeAPIReady = () => {
        ytApiReady = true;
        ytReadyCallbacks.forEach(cb => cb());
        ytReadyCallbacks.length = 0;
        ytErrorCallbacks.length = 0;
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    // onerror fires only when the script itself is blocked (adblocker / network failure).
    // "Tracking Prevention blocked access to storage" does NOT trigger onerror —
    // that is a cookie/localStorage restriction, not a script load failure.
    script.onerror = () => {
        ytApiLoaded = false; // allow retry on next component mount
        ytErrorCallbacks.forEach(cb => cb());
        ytErrorCallbacks.length = 0;
        ytReadyCallbacks.length = 0;
    };
    document.head.appendChild(script);
}

// ─── Component ─────────────────────────────────────────────────────────────

export const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(
    function MusicPlayer({ src, autoPlay }, ref) {
        const audioRef = useRef<HTMLAudioElement>(null);
        const ytPlayerRef = useRef<YTPlayer | null>(null);
        const pendingPlayRef = useRef(false); // play requested before player ready

        // useId() is SSR-safe: generates the SAME id on server and client,
        // preventing the hydration mismatch that Math.random() would cause.
        const uid = useId();
        // Sanitise the React id (contains ':') so it's a valid HTML id attribute.
        const playerId = `yt-bg-music-${uid.replace(/[^a-z0-9]/gi, "")}`;

        const [isPlaying, setIsPlaying] = useState(false);
        const [isMuted, setIsMuted] = useState(false);

        const youtubeId = src ? getYouTubeId(src) : null;
        const isYouTube = !!youtubeId;

        // ── Initialise YouTube IFrame API player (once per youtubeId) ──────
        useEffect(() => {
            if (!isYouTube || !youtubeId) return;

            let destroyed = false;

            const createPlayer = () => {
                if (destroyed) return;
                // Confirm the container element exists in the DOM by ID
                if (!document.getElementById(playerId)) return;

                // Destroy any previous player instance
                if (ytPlayerRef.current) {
                    try { ytPlayerRef.current.destroy(); } catch { /* noop */ }
                    ytPlayerRef.current = null;
                }

                try {
                    // Pass a STRING ID (not a DOM element) to YT.Player.
                    // When given a DOM element, YouTube's widgetapi.js can resolve
                    // the wrong contentWindow, causing the postMessage origin mismatch.
                    // With a string ID the API does its own getElementById lookup after
                    // the iframe is inserted, which is always reliable.
                    //
                    // Also: new YT.Player() returns a stub — do NOT call any methods on
                    // the returned object. Full API is only available after onReady fires.
                    new window.YT!.Player(playerId, {
                        videoId: youtubeId,
                        width: "200",
                        height: "200",
                        playerVars: {
                            autoplay: 0,       // controlled manually after user gesture
                            controls: 0,
                            loop: 1,
                            playlist: youtubeId, // required for loop
                            rel: 0,
                            modestbranding: 1,
                            iv_load_policy: 3,  // hide annotations
                            mute: 1,            // start muted; unMute() after user plays
                            // 'origin' tells YouTube which origin to accept postMessages
                            // from — fixes the cross-origin postMessage error.
                            origin: window.location.origin,
                        },
                        events: {
                            onReady: (event) => {
                                if (destroyed) return;
                                // Only HERE the player has all methods available
                                ytPlayerRef.current = event.target;
                                if (pendingPlayRef.current) {
                                    pendingPlayRef.current = false;
                                    event.target.unMute();
                                    event.target.playVideo();
                                    setIsPlaying(true);
                                    setIsMuted(false);
                                }
                            },
                            // onError: video-level errors (not embeddable, private, etc.)
                            // These are NOT the same as the API being blocked — ignore silently.
                        },
                    });
                    // Do NOT assign ytPlayerRef.current here — player is not ready yet
                } catch {
                    // constructor threw — silently ignore
                }
            };

            loadYouTubeApi(
                () => { if (!destroyed) createPlayer(); },
                // Only fires if the iframe_api script download itself fails (true network/adblocker block).
                // Tracking Prevention blocking storage is NOT this — that doesn't trigger script.onerror.
                () => { if (!destroyed) console.warn("[MusicPlayer] YouTube iframe_api failed to load."); }
            );

            return () => {
                destroyed = true;
                if (ytPlayerRef.current) {
                    try { ytPlayerRef.current.destroy(); } catch { /* noop */ }
                    ytPlayerRef.current = null;
                }
            };
        }, [isYouTube, youtubeId, playerId]);


        // ── Non-YouTube: reload audio on src change ─────────────────────────
        useEffect(() => {
            if (src && !isYouTube && audioRef.current) {
                audioRef.current.load();
                if (isPlaying) audioRef.current.play().catch(console.error);
            }
        }, [src, isYouTube]); // eslint-disable-line react-hooks/exhaustive-deps

        // ── pause-music event (e.g. from VoiceRecorder) ─────────────────────
        useEffect(() => {
            const handle = () => {
                setIsPlaying(false);
                if (isYouTube) {
                    ytPlayerRef.current?.pauseVideo();
                } else {
                    audioRef.current?.pause();
                }
            };
            window.addEventListener("pause-music", handle);
            return () => window.removeEventListener("pause-music", handle);
        }, [isYouTube]);

        // ── Global interaction listener (browser autoplay gate) ──────────────
        useEffect(() => {
            if (!autoPlay) return;

            const handle = () => {
                if (isYouTube) {
                    if (ytPlayerRef.current) {
                        ytPlayerRef.current.unMute();
                        ytPlayerRef.current.playVideo();
                        setIsPlaying(true);
                        setIsMuted(false);
                    } else {
                        // Player not ready yet — flag it
                        pendingPlayRef.current = true;
                    }
                } else if (audioRef.current) {
                    audioRef.current.muted = false;
                    audioRef.current.play().catch(console.error);
                    setIsPlaying(true);
                    setIsMuted(false);
                }
                remove();
            };

            const remove = () => {
                window.removeEventListener("click", handle);
                window.removeEventListener("touchstart", handle);
                window.removeEventListener("keydown", handle);
            };
            window.addEventListener("click", handle);
            window.addEventListener("touchstart", handle);
            window.addEventListener("keydown", handle);
            return remove;
        }, [autoPlay, isYouTube]);

        // ── Imperative handle for parent ─────────────────────────────────────
        useImperativeHandle(ref, () => ({
            play: () => {
                if (isYouTube) {
                    if (ytPlayerRef.current) {
                        ytPlayerRef.current.unMute();
                        ytPlayerRef.current.playVideo();
                    } else {
                        pendingPlayRef.current = true;
                    }
                } else if (audioRef.current) {
                    audioRef.current.muted = false;
                    audioRef.current.play().catch(console.error);
                }
                setIsPlaying(true);
                setIsMuted(false);
            },
            pause: () => {
                if (isYouTube) {
                    ytPlayerRef.current?.pauseVideo();
                } else {
                    audioRef.current?.pause();
                }
                setIsPlaying(false);
            },
            toggle: () => {
                setIsPlaying(prev => {
                    const next = !prev;
                    if (isYouTube) {
                        if (next) {
                            ytPlayerRef.current?.unMute();
                            ytPlayerRef.current?.playVideo();
                            setIsMuted(false);
                        } else {
                            ytPlayerRef.current?.pauseVideo();
                        }
                    } else if (audioRef.current) {
                        if (next) {
                            audioRef.current.play().catch(console.error);
                        } else {
                            audioRef.current.pause();
                        }
                    }
                    return next;
                });
            },
        }));

        // ── Toggle handlers ──────────────────────────────────────────────────
        const togglePlay = useCallback(() => {
            setIsPlaying(prev => {
                const next = !prev;
                if (isYouTube) {
                    if (next) {
                        if (ytPlayerRef.current) {
                            ytPlayerRef.current.unMute();
                            ytPlayerRef.current.playVideo();
                            setIsMuted(false);
                        } else {
                            pendingPlayRef.current = true;
                        }
                    } else {
                        ytPlayerRef.current?.pauseVideo();
                    }
                } else if (audioRef.current) {
                    if (next) {
                        audioRef.current.play().catch(console.error);
                    } else {
                        audioRef.current.pause();
                    }
                }
                return next;
            });
        }, [isYouTube]);

        const toggleMute = useCallback(() => {
            setIsMuted(prev => {
                const next = !prev;
                if (isYouTube) {
                    // Pure JS call — NO iframe reload, no new network request
                    if (next) {
                        ytPlayerRef.current?.mute();
                    } else {
                        ytPlayerRef.current?.unMute();
                    }
                } else if (audioRef.current) {
                    audioRef.current.muted = next;
                }
                return next;
            });
        }, [isYouTube]);

        // Don't render if no source
        if (!src) return null;

        return (
            <>
                {/* ── YouTube IFrame API player container ─────────────────────
                  * The div is kept tiny & near-invisible (opacity 0.01) so it stays
                  * "in-viewport" — required for browsers to honour autoplay.
                  * The YT.Player API replaces this div with the actual <iframe>.
                  * Mute / play / pause are all pure JS calls → no new network requests.
                  */}
                {isYouTube && (
                    /*
                     * Container for the YouTube IFrame API player.
                     * Requirements:
                     *   - Must have a stable string `id` (passed to new YT.Player(id))
                     *   - Must NOT use overflow:hidden — that can cause the iframe
                     *     contentWindow to resolve incorrectly inside the YT API
                     *   - Keep opacity near-zero but NOT zero/display:none so the
                     *     browser still considers it in-document for postMessage
                     *   - pointer-events:none so clicks fall through to the page
                     */
                    <div
                        id={playerId}
                        aria-hidden="true"
                        style={{
                            position: "fixed",
                            bottom: 0,
                            right: 0,
                            width: "200px",
                            height: "200px",
                            opacity: 0.001,
                            pointerEvents: "none",
                            zIndex: -10,
                        }}
                    />
                )}

                {/* ── HTML Audio (non-YouTube) ─────────────────────────────── */}
                {!isYouTube && (
                    <audio
                        ref={audioRef}
                        src={src}
                        loop
                        preload="auto"
                        autoPlay={autoPlay}
                        muted={isMuted}
                    />
                )}

                {/* ── Floating controls ────────────────────────────────────── */}
                <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
                    {/* Vinyl play/pause button */}
                    <button
                        onClick={togglePlay}
                        className={`relative w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl flex items-center justify-center transition-transform hover:scale-105 ${
                            isPlaying ? "animate-spin-slow" : ""
                        }`}
                        title={isPlaying ? "Tạm dừng" : "Phát nhạc"}
                    >
                        <div className="absolute inset-1 rounded-full border border-gray-600 opacity-30" />
                        <div className="absolute inset-2 rounded-full border border-gray-600 opacity-30" />
                        <div className="absolute inset-3 rounded-full border border-gray-600 opacity-30" />
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center">
                            {isPlaying ? (
                                <Pause className="w-3 h-3 text-white fill-white" />
                            ) : (
                                <Play className="w-3 h-3 text-white fill-white ml-0.5" />
                            )}
                        </div>
                    </button>

                    {/* Mute button */}
                    <button
                        onClick={toggleMute}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-lg ${
                            isMuted
                                ? "bg-gray-200 text-gray-500"
                                : "bg-white text-gray-700 hover:bg-gray-50"
                        }`}
                        title={isMuted ? "Bật âm" : "Tắt âm"}
                    >
                        {isMuted ? (
                            <VolumeX className="w-5 h-5" />
                        ) : (
                            <Volume2 className="w-5 h-5" />
                        )}
                    </button>
                </div>

                <style jsx>{`
                    @keyframes spin-slow {
                        from { transform: rotate(0deg); }
                        to   { transform: rotate(360deg); }
                    }
                    .animate-spin-slow {
                        animation: spin-slow 3s linear infinite;
                    }
                `}</style>
            </>
        );
    }
);
