import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthenticatedPage from './AuthenticatedPage'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default async function UserPage({
    params,
}: {
    params: { username: string }
}) {
    // Fetch page data
    const { data: page, error } = await supabase
        .from('pages')
        .select('*')
        .eq('username', params.username)
        .eq('is_active', true)
        .single()

    if (error || !page) {
        notFound()
    }

    // Check if onboarding is needed
    if (!page.passcode_hash) {
        return <OnboardingWizard page={page} />
    }

    // Show authenticated page with PIN screen
    return <AuthenticatedPage page={page} />
}
