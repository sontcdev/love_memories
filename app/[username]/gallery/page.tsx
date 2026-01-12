'use client'

import { useState, useEffect } from 'react'
import { Box, Container, Typography } from '@mui/material'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import NavigationDrawer from '@/components/templates/shared/NavigationDrawer'
import MasonryGallery from '@/components/gallery/MasonryGallery'
import ImageUpload from '@/components/gallery/ImageUpload'
import GalleryLightbox from '@/components/gallery/Lightbox'
import { getGalleryImages, uploadGalleryImage, reorderGalleryImages, deleteGalleryImage } from './actions'
import type { Page, ContentItem } from '@/lib/types'
import { TEMPLATE_COLORS } from '@/lib/types'

export default function GalleryPage() {
    const params = useParams()
    const username = params.username as string

    const [page, setPage] = useState<Page | null>(null)
    const [images, setImages] = useState<ContentItem[]>([])
    const [lightboxIndex, setLightboxIndex] = useState(-1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [username])

    const loadData = async () => {
        // Fetch page
        const { data: pageData } = await supabase
            .from('pages')
            .select('*')
            .eq('username', username)
            .single()

        if (pageData) {
            setPage(pageData)

            // Fetch gallery images
            const { data: galleryData } = await getGalleryImages(pageData.id)
            if (galleryData) {
                setImages(galleryData)
            }
        }

        setLoading(false)
    }

    const handleUploadSuccess = async (url: string) => {
        if (!page) return

        await uploadGalleryImage(page.id, url)
        loadData()
    }

    const handleReorder = async (orderedIds: string[]) => {
        await reorderGalleryImages(orderedIds)
    }

    const handleDelete = async (id: string) => {
        await deleteGalleryImage(id)
        setImages((prev) => prev.filter((img) => img.id !== id))
    }

    if (loading || !page) {
        return <Box sx={{ p: 4, textAlign: 'center' }}>Đang tải...</Box>
    }

    const colors = TEMPLATE_COLORS[page.template_type]
    const lightboxSlides = images.map((img) => ({
        src: img.image_url || '',
        alt: img.content,
    }))

    return (
        <Box
            sx={{
                minHeight: '100vh',
                bgcolor: colors.background,
            }}
        >
            <NavigationDrawer
                username={username}
                templateType={page.template_type}
                primaryColor={colors.primary}
                backgroundColor={colors.background}
            />

            <Container maxWidth="lg">
                <Box sx={{ pt: 8, pb: 4 }}>
                    <Typography
                        variant="h4"
                        gutterBottom
                        fontWeight={700}
                        sx={{ color: colors.primary }}
                    >
                        Ảnh Kỷ Niệm
                    </Typography>

                    <ImageUpload onUploadSuccess={handleUploadSuccess} primaryColor={colors.primary} />

                    {images.length > 0 ? (
                        <MasonryGallery
                            images={images}
                            onReorder={handleReorder}
                            onDelete={handleDelete}
                            onImageClick={setLightboxIndex}
                            primaryColor={colors.primary}
                        />
                    ) : (
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
                            Chưa có ảnh nào. Upload ảnh đầu tiên!
                        </Typography>
                    )}

                    <GalleryLightbox
                        images={lightboxSlides}
                        index={lightboxIndex}
                        onClose={() => setLightboxIndex(-1)}
                    />
                </Box>
            </Container>
        </Box>
    )
}
