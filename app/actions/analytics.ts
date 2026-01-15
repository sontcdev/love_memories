'use server';

import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

interface DeviceInfo {
    deviceType: string;
    browser: string;
    os: string;
}

/**
 * Parse user agent to extract device info
 */
function parseUserAgent(userAgent: string): DeviceInfo {
    const ua = userAgent.toLowerCase();

    // Detect device type
    let deviceType = 'Desktop';
    if (ua.includes('iphone')) deviceType = 'iPhone';
    else if (ua.includes('ipad')) deviceType = 'iPad';
    else if (ua.includes('android') && ua.includes('mobile')) deviceType = 'Android Phone';
    else if (ua.includes('android')) deviceType = 'Android Tablet';
    else if (ua.includes('mobile')) deviceType = 'Mobile';

    // Detect browser
    let browser = 'Unknown';
    if (ua.includes('edg/')) browser = 'Edge';
    else if (ua.includes('chrome/')) browser = 'Chrome';
    else if (ua.includes('firefox/')) browser = 'Firefox';
    else if (ua.includes('safari/') && !ua.includes('chrome')) browser = 'Safari';
    else if (ua.includes('opera') || ua.includes('opr/')) browser = 'Opera';

    // Detect OS
    let os = 'Unknown';
    if (ua.includes('windows')) os = 'Windows';
    else if (ua.includes('mac os x')) os = 'macOS';
    else if (ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';
    else if (ua.includes('android')) os = 'Android';
    else if (ua.includes('linux')) os = 'Linux';

    return { deviceType, browser, os };
}

/**
 * Hash IP address for privacy (one-way hash)
 */
function hashIp(ip: string): string {
    return crypto
        .createHash('sha256')
        .update(ip + process.env.IP_HASH_SALT || 'default-salt')
        .digest('hex');
}

/**
 * Log guest access to the link
 */
export async function logGuestAccess(
    linkId: string,
    userAgent: string,
    ipAddress?: string
) {
    try {
        const supabase = await createClient();

        // Parse user agent
        const deviceInfo = parseUserAgent(userAgent);

        // Hash IP address if provided (for privacy)
        const ipHash = ipAddress ? hashIp(ipAddress) : null;

        // Insert access log
        const { error } = await supabase
            .from('access_logs')
            .insert({
                link_id: linkId,
                device_type: deviceInfo.deviceType,
                browser: deviceInfo.browser,
                os: deviceInfo.os,
                ip_hash: ipHash,
            });

        if (error) {
            console.error('Access log error:', error);
            // Don't throw - logging should not break the app
        }

        return { success: true };

    } catch (error) {
        console.error('Log guest access error:', error);
        return { success: false };
    }
}
