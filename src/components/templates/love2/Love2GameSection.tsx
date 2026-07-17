"use client";

import { useState, useEffect } from "react";
import { Camera, Trophy, RotateCcw, Sparkles, Puzzle } from "lucide-react";

interface Love2GameSectionProps {
    photos: Array<{ id: string; url: string; caption?: string | null }>;
    isDark?: boolean;
}

interface PuzzlePiece {
    id: number;
    correctIndex: number;
    currentIndex: number;
    imageUrl: string;
}

export function Love2GameSection({ photos, isDark = false }: Love2GameSectionProps) {
    const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
    const [selectedPiece, setSelectedPiece] = useState<number | null>(null);
    const [moves, setMoves] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);

    const gridSize = 3;
    const totalPieces = gridSize * gridSize;

    useEffect(() => {
        if (photos.length >= 1) {
            initializeGame();
        }
    }, [photos]);

    const initializeGame = () => {
        const photo = photos[0];
        const newPieces: PuzzlePiece[] = [];

        for (let i = 0; i < totalPieces; i++) {
            newPieces.push({
                id: i,
                correctIndex: i,
                currentIndex: i,
                imageUrl: photo.url,
            });
        }

        const shuffledIndices = Array.from({ length: totalPieces }, (_, i) => i)
            .sort(() => Math.random() - 0.5);

        const shuffledPieces = newPieces.map((piece, index) => ({
            ...piece,
            currentIndex: shuffledIndices[index],
        }));

        setPieces(shuffledPieces);
        setSelectedPiece(null);
        setMoves(0);
        setIsComplete(false);
        setShowConfetti(false);
    };

    const handlePieceClick = (pieceId: number) => {
        if (isComplete) return;

        if (selectedPiece === null) {
            setSelectedPiece(pieceId);
        } else {
            if (selectedPiece === pieceId) {
                setSelectedPiece(null);
                return;
            }

            const newPieces = pieces.map(p => {
                if (p.id === selectedPiece) {
                    const targetPiece = pieces.find(pp => pp.id === pieceId);
                    return { ...p, currentIndex: targetPiece!.currentIndex };
                }
                if (p.id === pieceId) {
                    const sourcePiece = pieces.find(pp => pp.id === selectedPiece);
                    return { ...p, currentIndex: sourcePiece!.currentIndex };
                }
                return p;
            });

            setPieces(newPieces);
            setMoves(m => m + 1);
            setSelectedPiece(null);

            const isSolved = newPieces.every(p => p.correctIndex === p.currentIndex);
            if (isSolved) {
                setIsComplete(true);
                setShowConfetti(true);
            }
        }
    };

    const getPiecePosition = (piece: PuzzlePiece) => {
        const row = Math.floor(piece.currentIndex / gridSize);
        const col = piece.currentIndex % gridSize;
        return { row, col };
    };

    if (photos.length < 1) {
        return (
            <div className={`text-center py-12 ${isDark ? "text-slate-400" : "text-amber-600"}`}>
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-serif">Add at least 1 photo to play!</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-400 rounded-full blur-lg opacity-40 animate-pulse"></div>
                        <div className="relative w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                            <Puzzle className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <h2 className={`text-xl font-bold font-serif ${isDark ? "text-slate-100" : "text-amber-900"}`}>
                            Photo Puzzle
                        </h2>
                        <span className={`text-sm ${isDark ? "text-slate-400" : "text-amber-600"} font-serif`}>
                            Arrange the pieces to complete the photo
                        </span>
                    </div>
                </div>
                <button
                    onClick={initializeGame}
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white font-medium shadow-md hover:shadow-xl transition-all hover:scale-105 font-serif relative overflow-hidden group"
                >
                    <RotateCcw className="w-4 h-4 relative z-10" />
                    <span className="relative z-10">Reset</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                </button>
            </div>

            <div className={`flex items-center justify-center gap-6 p-4 rounded-xl ${isDark ? "bg-slate-800" : "bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200"}`}>
                <div className="text-center">
                    <p className={`text-2xl font-bold font-serif ${isDark ? "text-amber-400" : "text-amber-700"}`}>{moves}</p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-amber-600"} font-serif`}>Moves</p>
                </div>
                <div className="w-px h-8 bg-amber-200"></div>
                <div className="text-center">
                    <p className={`text-2xl font-bold font-serif ${isDark ? "text-orange-400" : "text-orange-700"}`}>
                        {pieces.filter(p => p.correctIndex === p.currentIndex).length}/{totalPieces}
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-amber-600"} font-serif`}>Correct</p>
                </div>
            </div>

            {isComplete && showConfetti && (
                <div className="relative">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div
                                key={i}
                                className="absolute animate-bounce"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    animationDuration: `${1 + Math.random() * 2}s`,
                                }}
                            >
                                <Sparkles className="w-6 h-6 text-amber-500" />
                            </div>
                        ))}
                    </div>
                    <div className={`relative text-center p-6 rounded-2xl ${isDark ? "bg-gradient-to-br from-amber-900/50 to-orange-900/50 border border-amber-700" : "bg-gradient-to-br from-amber-100 to-orange-100 border-4 border-white shadow-xl"}`}>
                        <div className="relative inline-block">
                            <div className="absolute inset-0 bg-yellow-400 blur-2xl opacity-50 animate-pulse rounded-full"></div>
                            <Trophy className="relative w-16 h-16 mx-auto mb-3 text-yellow-500 animate-bounce" />
                        </div>
                        <h3 className={`text-2xl font-bold mb-2 font-serif ${isDark ? "text-amber-100" : "text-amber-800"}`}>
                            Puzzle Complete! 🎉
                        </h3>
                        <p className={`font-serif ${isDark ? "text-amber-200" : "text-amber-700"}`}>
                            You solved it in {moves} moves!
                        </p>
                    </div>
                </div>
            )}

            <div className={`relative mx-auto ${isDark ? "" : "bg-white p-4 rounded-lg shadow-xl border-8 border-white"}`} style={{ maxWidth: "400px" }}>
                <div className="grid grid-cols-3 gap-1 aspect-square">
                    {pieces.map((piece) => {
                        const { row, col } = getPiecePosition(piece);
                        const isSelected = selectedPiece === piece.id;
                        const isCorrect = piece.correctIndex === piece.currentIndex;

                        return (
                            <button
                                key={piece.id}
                                onClick={() => handlePieceClick(piece.id)}
                                className={`relative overflow-hidden transition-all duration-300 ${
                                    isSelected
                                        ? "ring-4 ring-amber-400 scale-95 z-10 shadow-lg shadow-amber-400/50"
                                        : isCorrect
                                        ? "ring-2 ring-green-400 shadow-md shadow-green-400/30"
                                        : "hover:scale-105 hover:shadow-md"
                                }`}
                                style={{
                                    gridRow: row + 1,
                                    gridColumn: col + 1,
                                }}
                            >
                                <div
                                    className="w-full h-full bg-cover bg-no-repeat transition-transform duration-300"
                                    style={{
                                        backgroundImage: `url(${piece.imageUrl})`,
                                        backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
                                        backgroundPosition: `${(piece.correctIndex % gridSize) * (100 / (gridSize - 1))}% ${Math.floor(piece.correctIndex / gridSize) * (100 / (gridSize - 1))}%`,
                                    }}
                                />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-amber-400/20 animate-pulse"></div>
                                )}
                                {isCorrect && (
                                    <div className="absolute inset-0 bg-green-400/20 flex items-center justify-center">
                                        <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                                            <span className="text-white text-xs font-bold">✓</span>
                                        </div>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
