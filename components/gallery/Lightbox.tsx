'use client'

import Lightbox from 'yet-another-react-lightbox'
import Slideshow from 'yet-another-react-lightbox/plugins/slideshow'
import Zoom from 'yet-another-react-lightbox/plugins/zoom'
import 'yet-another-react-lightbox/styles.css'

interface GalleryLightboxProps {
    images: { src: string; alt?: string }[]
    index: number
    onClose: () => void
}

export default function GalleryLightbox({ images, index, onClose }: GalleryLightboxProps) {
    return (
        <Lightbox
            open={index >= 0}
            close={onClose}
            index={index}
            slides={images}
            plugins={[Slideshow, Zoom]}
            slideshow={{
                autoplay: true,
                delay: 5000,
            }}
            zoom={{
                maxZoomPixelRatio: 3,
            }}
        />
    )
}
