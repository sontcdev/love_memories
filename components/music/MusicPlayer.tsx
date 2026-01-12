'use client'

import { useState, useRef, useEffect } from 'react'
import { Fab } from '@mui/material'
import { MusicNote, Pause } from '@mui/icons-material'

interface MusicPlayerProps {
    trackUrl: string
    autoplay?: boolean
    primaryColor: string
}

export default function MusicPlayer({
    trackUrl,
    autoplay = false,
    primaryColor,
}: MusicPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false)
    const audioRef = useRef<HTMLAudioElement>(null)

    useEffect(() => {
        if (autoplay && audioRef.current) {
            // Try to autoplay (may be blocked by browser)
            audioRef.current.play().catch(() => {
                console.log('Autoplay blocked by browser')
            })
            setIsPlaying(true)
        }
    }, [autoplay])

    const handleToggle = () => {
        if (!audioRef.current) return

        if (isPlaying) {
            audioRef.current.pause()
            setIsPlaying(false)
        } else {
            audioRef.current.play()
            setIsPlaying(true)
        }
    }

    if (!trackUrl) return null

    return (
        <>
            <audio ref={audioRef} src={trackUrl} loop />

            <Fab
                onClick={handleToggle}
                size="medium"
                sx={{
                    position: 'fixed',
                    bottom: 24,
                    right: 24,
                    bgcolor: primaryColor,
                    color: 'white',
                    zIndex: 1000,
                    '&:hover': {
                        bgcolor: primaryColor,
                        opacity: 0.9,
                    },
                    animation: isPlaying ? 'rotate 3s linear infinite' : 'none',
                }}
            >
                {isPlaying ? <Pause /> : <MusicNote />}
            </Fab>

            <style jsx global>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </>
    )
}
