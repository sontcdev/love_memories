"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase, STORAGE_BUCKET, getPublicUrl } from "@/lib/supabase";
import { Mic, Square, Trash2, Check, Loader2, Play, Pause } from "lucide-react";

interface VoiceRecorderProps {
    slug: string;
    onUploadComplete: (url: string) => void;
    onCancel?: () => void;
    maxDurationSeconds?: number;
}

type RecorderState = "idle" | "recording" | "review" | "uploading";

// Detect supported audio MIME type
function getSupportedMimeType(): { mimeType: string; extension: string } {
    const types = [
        { mimeType: "audio/mp4", extension: "m4a" },
        { mimeType: "audio/webm;codecs=opus", extension: "webm" },
        { mimeType: "audio/webm", extension: "webm" },
        { mimeType: "audio/ogg;codecs=opus", extension: "ogg" },
    ];

    for (const type of types) {
        if (MediaRecorder.isTypeSupported(type.mimeType)) {
            return type;
        }
    }

    // Ultimate fallback
    return { mimeType: "", extension: "webm" };
}

// Generate file path for voice recording
function generateVoiceFilePath(slug: string, ext: string): string {
    const timestamp = Date.now();
    return `voice/${slug}/${timestamp}.${ext}`;
}

// Format seconds to MM:SS
function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function VoiceRecorder({
    slug,
    onUploadComplete,
    onCancel,
    maxDurationSeconds = 300,
}: VoiceRecorderProps) {
    const [state, setState] = useState<RecorderState>("idle");
    const [recordingTime, setRecordingTime] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const streamRef = useRef<MediaStream | null>(null);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const mimeInfoRef = useRef<{ mimeType: string; extension: string } | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    // Handle audio playback state
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => setIsPlaying(false);
        const handlePause = () => setIsPlaying(false);
        const handlePlay = () => setIsPlaying(true);

        audio.addEventListener("ended", handleEnded);
        audio.addEventListener("pause", handlePause);
        audio.addEventListener("play", handlePlay);

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.removeEventListener("pause", handlePause);
            audio.removeEventListener("play", handlePlay);
        };
    }, [audioUrl]);

    const startRecording = useCallback(async () => {
        setError(null);
        audioChunksRef.current = [];

        try {
            // Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100,
                },
            });

            streamRef.current = stream;

            // Get supported MIME type
            const mimeInfo = getSupportedMimeType();
            mimeInfoRef.current = mimeInfo;

            // Create MediaRecorder with options
            const options: MediaRecorderOptions = {};
            if (mimeInfo.mimeType) {
                options.mimeType = mimeInfo.mimeType;
            }

            const mediaRecorder = new MediaRecorder(stream, options);
            mediaRecorderRef.current = mediaRecorder;

            // Handle data available - crucial for iOS Safari
            mediaRecorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            // Handle stop
            mediaRecorder.onstop = () => {
                // Create blob from chunks
                const mimeType = mimeInfo.mimeType || "audio/webm";
                const blob = new Blob(audioChunksRef.current, { type: mimeType });

                if (blob.size === 0) {
                    setError("Recording failed. Please try again.");
                    setState("idle");
                    return;
                }

                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                setState("review");

                // Stop all tracks
                if (streamRef.current) {
                    streamRef.current.getTracks().forEach((track) => track.stop());
                }
            };

            mediaRecorder.onerror = () => {
                setError("Recording error occurred.");
                setState("idle");
            };

            // Start recording with timeslice for iOS Safari compatibility
            // timeslice ensures ondataavailable is called periodically
            mediaRecorder.start(1000);
            setState("recording");
            setRecordingTime(0);

            // Start timer
            timerRef.current = setInterval(() => {
                setRecordingTime((prev) => {
                    const newTime = prev + 1;
                    // Auto-stop at max duration
                    if (newTime >= maxDurationSeconds) {
                        stopRecording();
                    }
                    return newTime;
                });
            }, 1000);
        } catch (err) {
            console.error("Failed to start recording:", err);
            if (err instanceof DOMException && err.name === "NotAllowedError") {
                setError("Microphone access denied. Please allow access and try again.");
            } else {
                setError("Failed to start recording. Please check your microphone.");
            }
        }
    }, [maxDurationSeconds]);

    const stopRecording = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            // Request final data before stopping (important for iOS Safari)
            mediaRecorderRef.current.requestData();
            mediaRecorderRef.current.stop();
        }
    }, []);

    const deleteRecording = useCallback(() => {
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        setAudioBlob(null);
        setAudioUrl(null);
        setRecordingTime(0);
        setState("idle");
        audioChunksRef.current = [];
    }, [audioUrl]);

    const uploadRecording = useCallback(async () => {
        if (!audioBlob || !mimeInfoRef.current) return;

        setState("uploading");
        setError(null);

        try {
            const ext = mimeInfoRef.current.extension;
            const fileName = `recording_${Date.now()}.${ext}`;
            const file = new File([audioBlob], fileName, {
                type: audioBlob.type,
            });

            const filePath = generateVoiceFilePath(slug, ext);

            const { error: uploadError } = await supabase.storage
                .from(STORAGE_BUCKET)
                .upload(filePath, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (uploadError) throw uploadError;

            const publicUrl = getPublicUrl(filePath);
            onUploadComplete(publicUrl);

            // Cleanup
            deleteRecording();
        } catch (err) {
            console.error("Upload failed:", err);
            setError("Failed to upload recording. Please try again.");
            setState("review");
        }
    }, [audioBlob, slug, onUploadComplete, deleteRecording]);

    const togglePlayback = useCallback(() => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    }, [isPlaying]);

    return (
        <div className="flex flex-col items-center gap-4">
            {/* Error Message */}
            {error && (
                <div className="w-full p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center">
                    {error}
                </div>
            )}

            {/* Idle State - Mic Button */}
            {state === "idle" && (
                <button
                    onClick={startRecording}
                    className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all active:scale-95"
                    aria-label="Start recording"
                >
                    <Mic className="w-8 h-8 text-white" />
                </button>
            )}

            {/* Recording State - Pulsing Animation + Timer */}
            {state === "recording" && (
                <div className="flex flex-col items-center gap-4">
                    {/* Pulsing Animation */}
                    <div className="relative">
                        {/* Outer pulse rings */}
                        <div className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-20" />
                        <div
                            className="absolute inset-0 rounded-full bg-pink-400 animate-ping opacity-20"
                            style={{ animationDelay: "0.5s" }}
                        />

                        {/* Stop Button */}
                        <button
                            onClick={stopRecording}
                            className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all animate-pulse"
                            aria-label="Stop recording"
                        >
                            <Square className="w-8 h-8 text-white fill-white" />
                        </button>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-2xl font-mono font-semibold text-gray-800">
                            {formatTime(recordingTime)}
                        </span>
                    </div>

                    {/* Max duration hint */}
                    <p className="text-xs text-gray-400">
                        Max: {formatTime(maxDurationSeconds)}
                    </p>
                </div>
            )}

            {/* Review State - Audio Player + Actions */}
            {state === "review" && audioUrl && (
                <div className="w-full flex flex-col items-center gap-4">
                    {/* Audio Element (hidden) */}
                    <audio ref={audioRef} src={audioUrl} preload="metadata" />

                    {/* Custom Player UI */}
                    <div className="w-full flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <button
                            onClick={togglePlayback}
                            className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-md hover:shadow-lg transition-all"
                            aria-label={isPlaying ? "Pause" : "Play"}
                        >
                            {isPlaying ? (
                                <Pause className="w-5 h-5 text-white" />
                            ) : (
                                <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                        </button>

                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-700">
                                Recording
                            </p>
                            <p className="text-xs text-gray-400">
                                {formatTime(recordingTime)}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={deleteRecording}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                            Xóa
                        </button>
                        <button
                            onClick={uploadRecording}
                            className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-md"
                        >
                            <Check className="w-4 h-4" />
                            Lưu
                        </button>
                    </div>

                    {/* Cancel option */}
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            Hủy
                        </button>
                    )}
                </div>
            )}

            {/* Uploading State */}
            {state === "uploading" && (
                <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                    <p className="text-gray-600 font-medium">Đang tải lên...</p>
                </div>
            )}
        </div>
    );
}
