'use client'

import { Box } from '@mui/material'

interface PinInputProps {
    value: string
    length?: number
    shake?: boolean
}

export default function PinInput({ value, length = 6, shake = false }: PinInputProps) {
    const circles = Array.from({ length }, (_, i) => i)

    return (
        <Box
            sx={{
                display: 'flex',
                gap: 2,
                justifyContent: 'center',
                alignItems: 'center',
                my: 4,
            }}
            className={shake ? 'shake' : ''}
        >
            {circles.map((i) => (
                <Box
                    key={i}
                    sx={{
                        width: { xs: 50, sm: 60 },
                        height: { xs: 50, sm: 60 },
                        borderRadius: '50%',
                        border: '3px solid',
                        borderColor: value[i] ? 'primary.main' : 'grey.400',
                        backgroundColor: value[i] ? 'primary.main' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease-in-out',
                        position: 'relative',
                    }}
                >
                    {value[i] && (
                        <Box
                            sx={{
                                width: 16,
                                height: 16,
                                borderRadius: '50%',
                                backgroundColor: 'white',
                            }}
                        />
                    )}
                </Box>
            ))}

            <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }

        .shake {
          animation: shake 0.5s;
        }
      `}</style>
        </Box>
    )
}
