'use client';

import { useRef, forwardRef, useImperativeHandle, useState } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';

interface MusicPlayerProps {
    videoId?: string;
    autoPlay?: boolean;
}

export interface MusicPlayerRef {
    togglePlay: () => void;
    getIsPlaying: () => boolean;
}

const MusicPlayer = forwardRef<MusicPlayerRef, MusicPlayerProps>(
    ({ videoId = 'dQw4w9WgXcQ', autoPlay = false }, ref) => {
        const [isPlaying, setIsPlaying] = useState(autoPlay);
        const playerRef = useRef<any>(null);

        const onPlayerReady: YouTubeProps['onReady'] = (event) => {
            playerRef.current = event.target;

            if (autoPlay) {
                event.target.playVideo();
                setIsPlaying(true);
            }
        };

        const onPlayerStateChange: YouTubeProps['onStateChange'] = (event) => {
            setIsPlaying(event.data === 1);

            // Loop when ended
            if (event.data === 0) {
                event.target.playVideo();
            }
        };

        const togglePlay = () => {
            if (!playerRef.current) return;

            if (isPlaying) {
                playerRef.current.pauseVideo();
            } else {
                playerRef.current.playVideo();
            }
        };

        const getIsPlaying = () => isPlaying;

        // Expose methods to parent via ref
        useImperativeHandle(ref, () => ({
            togglePlay,
            getIsPlaying,
        }));

        const opts: YouTubeProps['opts'] = {
            height: '0',
            width: '0',
            playerVars: {
                autoplay: autoPlay ? 1 : 0,
                controls: 0,
                disablekb: 1,
                fs: 0,
                modestbranding: 1,
                playsinline: 1,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
            },
        };

        return (
            <div className="hidden">
                <YouTube
                    videoId={videoId}
                    opts={opts}
                    onReady={onPlayerReady}
                    onStateChange={onPlayerStateChange}
                />
            </div>
        );
    }
);

MusicPlayer.displayName = 'MusicPlayer';

export default MusicPlayer;
