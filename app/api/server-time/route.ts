import { NextResponse } from 'next/server';

export async function GET() {
    // Return server time in ISO format
    const serverTime = new Date().toISOString();

    return NextResponse.json({
        serverTime,
        timestamp: Date.now(),
    });
}
