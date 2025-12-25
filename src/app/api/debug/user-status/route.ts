import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const secret = searchParams.get('secret')

    // if (secret !== 'RecoilDebugSecret') {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    try {
        // 1. Check Auth
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers()
        const authUser = users?.find(u => u.email === email)

        // 2. Check Profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('email', email)
            .single()

        return NextResponse.json({
            email,
            auth: authUser ? { id: authUser.id, created: authUser.created_at } : 'NOT_FOUND',
            profile: profile || 'NOT_FOUND',
            authError: authError?.message,
            profileError: profileError?.message
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
