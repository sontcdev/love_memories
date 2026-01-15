import { createClient } from '@/lib/supabase/server';
import AdminPageClient from '@/components/admin/AdminPageClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Admin Dashboard - Kỷ Niệm Số',
    description: 'Manage digital memory links',
};

export default async function AdminPage() {
    const supabase = await createClient();

    // Fetch all active links
    const { data: links } = await supabase
        .from('links')
        .select('id, username, template_type, created_at, settings')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    return <AdminPageClient links={links || []} />;
}
