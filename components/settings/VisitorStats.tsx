'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Eye, Smartphone, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';

interface AccessLog {
    id: string;
    visited_at: string;
    device_type: string;
    browser: string;
    os: string;
}

interface VisitorStatsProps {
    linkId: string;
}

export default function VisitorStats({ linkId }: VisitorStatsProps) {
    const [logs, setLogs] = useState<AccessLog[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchLogs();
    }, [linkId]);

    const fetchLogs = async () => {
        try {
            // Get logs from last 7 days
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const { data, error } = await supabase
                .from('access_logs')
                .select('*')
                .eq('link_id', linkId)
                .gte('visited_at', sevenDaysAgo.toISOString())
                .order('visited_at', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-sm text-gray-500">
                Đang tải thống kê...
            </div>
        );
    }

    const totalVisits = logs.length;
    const lastVisit = logs[0];

    // Group by day
    const visitsByDay: { [key: string]: number } = {};
    logs.forEach(log => {
        const day = new Date(log.visited_at).toLocaleDateString('vi-VN');
        visitsByDay[day] = (visitsByDay[day] || 0) + 1;
    });

    // Get time ago string
    const getTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        return `${diffDays} ngày trước`;
    };

    // Get device icon
    const getDeviceIcon = (deviceType: string) => {
        if (deviceType.includes('iPhone') || deviceType.includes('Android') || deviceType.includes('Mobile')) {
            return <Smartphone className="w-4 h-4" />;
        }
        return <Monitor className="w-4 h-4" />;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                    Lượt Truy Cập
                </h3>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                    <div className="text-2xl font-bold text-blue-700">
                        {totalVisits}
                    </div>
                    <div className="text-sm text-blue-600">
                        Lượt xem (7 ngày)
                    </div>
                </div>

                {lastVisit && (
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                            {getDeviceIcon(lastVisit.device_type)}
                            <div className="text-sm font-semibold text-purple-700">
                                {lastVisit.device_type}
                            </div>
                        </div>
                        <div className="text-xs text-purple-600">
                            {getTimeAgo(lastVisit.visited_at)}
                        </div>
                    </div>
                )}
            </div>

            {/* Recent Visits */}
            {logs.length > 0 && (
                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">
                        Truy cập gần đây:
                    </h4>
                    <div className="max-h-48 overflow-y-auto space-y-2">
                        {logs.slice(0, 10).map((log, index) => (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    {getDeviceIcon(log.device_type)}
                                    <div>
                                        <div className="font-medium text-gray-800">
                                            {log.device_type}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {log.browser} • {log.os}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-xs text-gray-500">
                                    {getTimeAgo(log.visited_at)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {logs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    <Eye className="w-12 h-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">Chưa có lượt truy cập nào</p>
                </div>
            )}
        </div>
    );
}
