'use client';

import { useState } from 'react';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';

interface Link {
    id: string;
    username: string;
    template_type: string;
    created_at: string;
    settings: any;
}

interface AdminPageClientProps {
    links: Link[];
}

export default function AdminPageClient({ links }: AdminPageClientProps) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-12 max-w-7xl">
                <AdminDashboard links={links} />
            </div>
        </div>
    );
}
