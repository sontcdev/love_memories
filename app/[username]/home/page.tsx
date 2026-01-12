import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getTemplate } from '@/lib/templateFactory'

export default async function HomePage({
    params,
}: {
    params: { username: string }
}) {
    // Fetch page and page_data
    const { data: page, error: pageError } = await supabase
        .from('pages')
        .select('*')
        .eq('username', params.username)
        .eq('is_active', true)
        .single()

    if (pageError || !page) {
        notFound()
    }

    const { data: pageData, error: dataError } = await supabase
        .from('page_data')
        .select('*')
        .eq('page_id', page.id)
        .single()

    if (dataError || !pageData) {
        // No page data yet - might be in onboarding
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Data not found</h1>
                <p>This page hasn't been set up yet.</p>
            </div>
        )
    }

    // Use factory to get the correct template
    return getTemplate(page, pageData)
}
