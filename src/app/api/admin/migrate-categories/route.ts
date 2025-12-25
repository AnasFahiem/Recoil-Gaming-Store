import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Update Flag, Figure, Decor -> Accessory
        const { count, error } = await supabase
            .from('products')
            .update({ category: 'Accessory' })
            .in('category', ['Flag', 'Figure', 'Decor'])
            // @ts-ignore
            .select('*', { count: 'exact', head: true })

        if (error) throw error

        return NextResponse.json({
            success: true,
            message: `Migration complete. Products updated to 'Accessory'.`,
            updatedCount: count
        })

    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json(
            { error: error.message || 'Migration failed' },
            { status: 500 }
        )
    }
}
