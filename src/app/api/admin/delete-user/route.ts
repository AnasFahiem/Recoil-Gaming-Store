import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({
            error: "Service Key Missing. Cannot delete users without SUPABASE_SERVICE_ROLE_KEY."
        }, { status: 500 })
    }

    const { userId } = await request.json()

    if (!userId) {
        return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    // Delete from Supabase Auth (Cascade should handle profile if set up, but we can double check)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
