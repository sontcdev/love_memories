'use client'

import { useState } from 'react'
import { Box, IconButton } from '@mui/material'
import { Delete } from '@mui/icons-material'
import Masonry from 'react-masonry-css'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import type { ContentItem } from '@/lib/types'

interface MasonryGalleryProps {
    images: ContentItem[]
    onReorder: (orderedIds: string[]) => void
    onDelete: (id: string) => void
    onImageClick: (index: number) => void
    primaryColor: string
}

export default function MasonryGallery({
    images,
    onReorder,
    onDelete,
    onImageClick,
    primaryColor,
}: MasonryGalleryProps) {
    const [localImages, setLocalImages] = useState(images)

    const breakpointColumns = {
        default: 3,
        1100: 2,
        700: 1,
    }

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return

        const items = Array.from(localImages)
        const [reordered] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reordered)

        setLocalImages(items)
        onReorder(items.map((item) => item.id))
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="gallery">
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                        <Masonry
                            breakpointCols={breakpointColumns}
                            className="masonry-grid"
                            columnClassName="masonry-grid-column"
                        >
                            {localImages.map((image, index) => (
                                <Draggable key={image.id} draggableId={image.id} index={index}>
                                    {(provided, snapshot) => (
                                        <Box
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            sx={{
                                                position: 'relative',
                                                cursor: snapshot.isDragging ? 'grabbing' : 'grab',
                                                marginBottom: 2,
                                                borderRadius: 2,
                                                overflow: 'hidden',
                                                boxShadow: snapshot.isDragging ? 6 : 2,
                                                transition: 'box-shadow 0.2s',
                                                '&:hover .delete-button': {
                                                    opacity: 1,
                                                },
                                            }}
                                        >
                                            <Box
                                                component="img"
                                                src={image.image_url || ''}
                                                alt={image.content}
                                                onClick={() => onImageClick(index)}
                                                sx={{
                                                    width: '100%',
                                                    display: 'block',
                                                    cursor: 'pointer',
                                                }}
                                            />

                                            <IconButton
                                                className="delete-button"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onDelete(image.id)
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 8,
                                                    right: 8,
                                                    bgcolor: 'rgba(0,0,0,0.6)',
                                                    color: 'white',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                    '&:hover': {
                                                        bgcolor: primaryColor,
                                                    },
                                                }}
                                                size="small"
                                            >
                                                <Delete />
                                            </IconButton>
                                        </Box>
                                    )}
                                </Draggable>
                            ))}
                        </Masonry>
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>

            <style jsx global>{`
        .masonry-grid {
          display: flex;
          margin-left: -16px;
          width: auto;
        }

        .masonry-grid-column {
          padding-left: 16px;
          background-clip: padding-box;
        }
      `}</style>
        </DragDropContext>
    )
}
