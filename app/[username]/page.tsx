import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TemplateWrapper from '@/components/templates/TemplateWrapper';
import HomePage from '@/components/home/HomePage';

interface PageProps {
    params: Promise<{
        username: string;
    }>;
}

/**
 * Main Dynamic Route Page - Server Component
 * Route: /[username]
 * 
 * This is a Next.js Server Component that:
 * 1. Fetches link data from Supabase based on username
 * 2. Validates the link exists and is active
 * 3. Returns 404 if not found
 * 4. Passes data to Client Components for rendering
 */
export default async function UsernamePage({ params }: PageProps) {
    const { username } = await params;
    const supabase = await createClient();

    // Server-side data fetching - runs on server only
    const { data: link, error } = await supabase
        .from('links')
        .select('id, username, settings, is_active')
        .eq('username', username)
        .eq('is_active', true)
        .single();

    // Show 404 if link not found or inactive
    if (error || !link) {
        notFound();
    }

    /**
     * Component Hierarchy:
     * 
     * TemplateWrapper (Client Component)
     * ├── GuestPasswordGate (Layer 1 - Password validation)
     * ├── OwnerPinModal (Layer 2 - PIN validation for edit mode)
     * ├── EditModeToggle (Floating button)
     * └── HomePage (Main content - Client Component)
     *     ├── TapToOpenOverlay (Music autoplay gate)
     *     ├── MusicPlayer (YouTube audio with controls)
     *     ├── Hero Section (Names, short note)
     *     ├── DaysCounter (Animated counter)
     *     ├── Gallery Section (Masonry layout with uploader)
     *     ├── TimeCapsule (Locked/unlocked envelopes)
     *     ├── FlashcardGame (3D flip cards)
     *     ├── Timeline (Coming soon)
     *     └── Footer
     */
    return (
        <TemplateWrapper username={username} linkId={link.id}>
            <HomePage linkId={link.id} username={username} settings={link.settings} />
        </TemplateWrapper>
    );
}

/**
 * Generate Dynamic Metadata
 * Creates SEO-friendly titles based on couple names or username
 */
export async function generateMetadata({ params }: PageProps) {
    const { username } = await params;
    const supabase = await createClient();

    const { data: link } = await supabase
        .from('links')
        .select('settings')
        .eq('username', username)
        .single();

    const names = link?.settings?.names;
    const title = names
        ? `${names[0]} & ${names[1]} - Kỷ Niệm Số`
        : `${username} - Kỷ Niệm Số`;

    return {
        title,
        description: `Trang kỷ niệm số của ${username}`,
    };
}

