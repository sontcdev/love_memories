'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createLink, resetPin, deleteLink } from '@/app/actions/admin';
import {
    RefreshCw, Plus, Trash2, Copy, Check, Link2, Eye, TrendingUp,
    LayoutDashboard, Users, Settings as SettingsIcon, Heart, ExternalLink
} from 'lucide-react';

interface Link {
    id: string;
    username: string;
    template_type: string;
    created_at: string;
    settings: any;
}

interface AdminDashboardProps {
    links: Link[];
}

export default function AdminDashboard({ links }: AdminDashboardProps) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [createResult, setCreateResult] = useState<any>(null);
    const [copiedPin, setCopiedPin] = useState<string | null>(null);

    // Mock stats
    const totalLinks = links.length;
    const totalViews = 12547;

    const handleCreateLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateResult(null);

        const result = await createLink(newUsername.toLowerCase().trim());

        setIsCreating(false);

        if (result.success) {
            setCreateResult(result.data);
            setNewUsername('');
        } else {
            alert(result.error);
        }
    };

    const handleResetPin = async (linkId: string, username: string) => {
        if (!confirm(`Reset PIN for ${username}?`)) return;

        const result = await resetPin(linkId);

        if (result.success) {
            alert(`New PIN: ${result.data?.pin}\n\nPlease save this PIN!`);
        } else {
            alert(result.error);
        }
    };

    const handleDeleteLink = async (linkId: string, username: string) => {
        if (!confirm(`Delete link ${username}? This cannot be undone.`)) return;

        const result = await deleteLink(linkId);

        if (result.success) {
            alert('Link deleted successfully');
        } else {
            alert(result.error);
        }
    };

    const copyToClipboard = async (text: string, type: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedPin(type);
        setTimeout(() => setCopiedPin(null), 2000);
    };

    const getAvatar = (username: string) => {
        const colors = [
            'from-violet-500 to-purple-500',
            'from-blue-500 to-cyan-500',
            'from-green-500 to-emerald-500',
            'from-orange-500 to-red-500',
            'from-pink-500 to-rose-500',
        ];
        const letter = username.charAt(0).toUpperCase();
        const gradient = colors[username.charCodeAt(0) % colors.length];
        return { letter, gradient };
    };

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar - Clean White */}
            <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
                {/* Logo */}
                <div className="p-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                            <Heart className="w-5 h-5 text-white" />
                        </div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Kỷ Niệm Số
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium bg-purple-50 text-purple-600 rounded-lg">
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-gray-50 hover:text-slate-900 rounded-lg transition-colors">
                        <Users className="w-5 h-5" />
                        <span>Users</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:bg-gray-50 hover:text-slate-900 rounded-lg transition-colors">
                        <SettingsIcon className="w-5 h-5" />
                        <span>Settings</span>
                    </button>
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <p className="text-xs text-slate-400">Admin Panel v1.0</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-7xl mx-auto p-8 space-y-8">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900">Dashboard</h2>
                            <p className="text-slate-500 mt-1">Manage your digital memory links</p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Link</span>
                        </motion.button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Total Links */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <Link2 className="w-5 h-5 text-blue-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-3xl font-bold text-slate-900">{totalLinks}</div>
                                <div className="text-sm text-slate-500 mt-1">Total Links</div>
                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+12% vs last week</span>
                                </div>
                            </div>
                        </div>

                        {/* Total Views */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                        <Eye className="w-5 h-5 text-purple-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-3xl font-bold text-slate-900">{totalViews.toLocaleString()}</div>
                                <div className="text-sm text-slate-500 mt-1">Total Views</div>
                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+8% vs last week</span>
                                </div>
                            </div>
                        </div>

                        {/* Active Rate */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-green-600" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4">
                                <div className="text-3xl font-bold text-slate-900">98.5%</div>
                                <div className="text-sm text-slate-500 mt-1">Active Rate</div>
                                <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+2.3% vs last week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Links Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-semibold text-slate-900">Links</h3>
                            <p className="text-sm text-slate-500 mt-1">{links.length} total links</p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Template</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {links.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-500 text-sm">
                                                No links created yet
                                            </td>
                                        </tr>
                                    ) : (
                                        links.map((link) => {
                                            const avatar = getAvatar(link.username);
                                            const formattedDate = new Date(link.created_at).toLocaleDateString('en-US', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            });

                                            return (
                                                <tr key={link.id} className="hover:bg-gray-50 transition-colors">
                                                    {/* User */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-9 h-9 bg-gradient-to-br ${avatar.gradient} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                                                                {avatar.letter}
                                                            </div>
                                                            <div>
                                                                <a
                                                                    href={`/${link.username}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-sm font-medium text-slate-900 hover:text-purple-600 flex items-center gap-1 group"
                                                                >
                                                                    {link.username}
                                                                    <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </a>
                                                                <div className="text-xs text-slate-500">/{link.username}</div>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Template */}
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex px-2.5 py-1 text-xs font-medium capitalize bg-pink-50 text-pink-700 rounded-md">
                                                            {link.template_type}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-green-50 text-green-700 rounded-md">
                                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                            Active
                                                        </span>
                                                    </td>

                                                    {/* Created */}
                                                    <td className="px-6 py-4 text-sm text-slate-500">
                                                        {formattedDate}
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleResetPin(link.id, link.username)}
                                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Reset PIN"
                                                            >
                                                                <RefreshCw className="w-4 h-4" />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => handleDeleteLink(link.id, link.username)}
                                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </motion.button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Link Modal - Keep existing modal code */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !isCreating && setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
                        >
                            {!createResult ? (
                                <>
                                    <div className="p-6 border-b border-gray-200">
                                        <h2 className="text-2xl font-bold text-gray-800">Create New Link</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Create a new digital memories link
                                        </p>
                                    </div>

                                    <form onSubmit={handleCreateLink} className="p-6">
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Username *
                                            </label>
                                            <input
                                                type="text"
                                                value={newUsername}
                                                onChange={(e) => setNewUsername(e.target.value)}
                                                placeholder="e.g., john-and-jane"
                                                pattern="[a-z0-9_-]+"
                                                required
                                                disabled={isCreating}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent disabled:opacity-50"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Lowercase letters, numbers, hyphens, underscores only
                                            </p>
                                        </div>

                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowCreateModal(false)}
                                                disabled={isCreating}
                                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isCreating || !newUsername}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isCreating ? 'Creating...' : 'Create Link'}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="p-8">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Check className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                            Link Created!
                                        </h2>
                                        <p className="text-gray-600">
                                            Save the information below
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Link URL
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={`${window.location.origin}${createResult.url}`}
                                                    readOnly
                                                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(`${window.location.origin}${createResult.url}`, 'url')}
                                                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                                                    title="Copy"
                                                >
                                                    {copiedPin === 'url' ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-gray-600" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                            <label className="block text-sm font-medium text-amber-800 mb-2">
                                                Owner PIN (Save this!)
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={createResult.pin}
                                                    readOnly
                                                    className="flex-1 px-3 py-2 bg-white border border-amber-300 rounded font-mono text-lg font-bold text-center"
                                                />
                                                <button
                                                    onClick={() => copyToClipboard(createResult.pin, 'pin')}
                                                    className="p-2 hover:bg-amber-200 rounded transition-colors"
                                                    title="Copy"
                                                >
                                                    {copiedPin === 'pin' ? (
                                                        <Check className="w-4 h-4 text-green-600" />
                                                    ) : (
                                                        <Copy className="w-4 h-4 text-amber-600" />
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-xs text-amber-700 mt-2">
                                                ⚠️ This PIN cannot be recovered. Please save it now!
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => {
                                            setCreateResult(null);
                                            setShowCreateModal(false);
                                        }}
                                        className="w-full mt-6 px-4 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
                                    >
                                        Done
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
