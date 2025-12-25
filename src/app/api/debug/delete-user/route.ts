import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')
    const secret = searchParams.get('secret')

    if (secret !== 'RecoilFix') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!email) {
        return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    try {
        // 1. Find User
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })
        if (listError) throw listError

        const user = users.find(u => u.email === email)

        if (!user) {
            return NextResponse.json({ message: 'User not found in Auth. Nothing to delete.' })
        }

        // 2. Delete User
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
        if (deleteError) throw deleteError

        return NextResponse.json({ success: true, message: `User ${email} deleted from Auth. You can now sign up again.` })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
