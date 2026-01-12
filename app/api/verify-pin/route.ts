import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
    try {
        const { username, pin } = await request.json()

        if (!username || !pin) {
            return NextResponse.json(
                { success: false, error: 'Missing username or pin' },
                { status: 400 }
            )
        }

        // Call Supabase function to verify PIN
        const { data, error } = await supabase.rpc('verify_page_passcode', {
            p_username: username,
            p_passcode: pin,
        })

        if (error) {
            console.error('Verification error:', error)
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: data })
    } catch (error) {
        console.error('Unexpected error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        )
    }
}
