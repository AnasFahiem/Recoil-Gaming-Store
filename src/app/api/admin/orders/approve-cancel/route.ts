
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

import { sendEmail } from '@/lib/send-mail'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { orderId } = body

        if (!orderId) {
            return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
        }

        // 1. Authenticate User (Try Cookies first, then Header)
        let user = null;
        const supabase = createServerClient()
        const { data: { user: cookieUser } } = await supabase.auth.getUser()
        user = cookieUser

        // Fallback: Check Authorization Header
        if (!user) {
            const authHeader = req.headers.get('Authorization')
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '')
                const { data: { user: headerUser } } = await supabase.auth.getUser(token)
                user = headerUser
            }
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Initialize Service Role Client (for Admin/DB operations)
        const supabaseService = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 3. Verify Admin Status
        const { data: adminCheck } = await supabaseService.rpc('is_admin_check', { user_id: user.id })
        if (!adminCheck) {
            return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 })
        }

        // 4. Fetch Order Details (Fetch Profile Separately)
        const { data: order, error: fetchError } = await supabaseService
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single()

        if (fetchError || !order) {
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // Fetch profile specifically for email
        const { data: profile } = await supabaseService
            .from('profiles')
            .select('email, username')
            .eq('id', order.user_id)
            .single()

        order.profiles = profile






        // 5. Send Email to User

        // Fetch User Email from Auth (More reliable than profiles table)
        const { data: { user: authUser }, error: userError } = await supabaseService.auth.admin.getUserById(order.user_id)

        if (userError || !authUser?.email) {
            console.error("Could not fetch user email from Auth:", userError)
            // Proceed to delete? Or fail? 
            // We should probably proceed but log clearly.
        } else {
            const userEmail = authUser.email

            const emailHtml = `
                    <div style="font-family: sans-serif; background: #0F1113; color: #F0F2F5; padding: 20px;">
                    <h2 style="color: #D72631;">Order Canceled</h2>
                    <p>Dear ${order.profiles?.username || 'Customer'},</p>
                    <p>Your cancellation request for Order <strong>#${order.id.slice(0, 8)}</strong> has been approved and processed.</p>
                    <p>The order has been removed from our records.</p>
                    <hr style="border-color: #333;" />
                    <p style="font-size: 12px; color: #666;">RECOIL System</p>
                </div>
            `

            await sendEmail({
                to: userEmail,
                subject: `Order Canceled #${order.id.slice(0, 8)}`,
                html: emailHtml
            })
        }

        // 6. Delete Order
        // Using delete() directly. RLS might block this if role is not fully propagated, but we are using Service Key so it should bypass RLS.
        const { error: deleteError } = await supabaseService
            .from('orders')
            .delete()
            .eq('id', orderId)

        if (deleteError) {
            console.error("CRITICAL: Failed to delete order although email was sent.", deleteError)
            return NextResponse.json({ error: `Failed to delete order: ${deleteError.message}` }, { status: 500 })
        }

        console.log(`Order ${orderId} successfully deleted.`)

        return NextResponse.json({ success: true, message: "Order deleted and user notified." })

    } catch (error: any) {
        console.error('Approve Cancel Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
