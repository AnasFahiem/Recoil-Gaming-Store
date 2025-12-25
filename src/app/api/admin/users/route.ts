import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Check if Service Key is available
    if (!supabaseUrl || !supabaseServiceKey) {
        return NextResponse.json({
            error: "Service Key Missing",
            users: [],
            message: "To view real users, add SUPABASE_SERVICE_ROLE_KEY to Vercel Env Vars."
        }, { status: 200 }) // Return 200 to handle gracefully on client
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Map to simplified user object
    const simplifiedUsers = users.map(user => ({
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        role: user.role
    }))

    return NextResponse.json({ users: simplifiedUsers })
}
