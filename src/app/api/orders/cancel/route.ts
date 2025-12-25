
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

        // Fallback: Check Authorization Header if cookie auth failed
        if (!user) {
            const authHeader = req.headers.get('Authorization')
            if (authHeader) {
                const token = authHeader.replace('Bearer ', '')
                const { data: { user: headerUser } } = await supabase.auth.getUser(token)
                user = headerUser
            }
        }

        if (!user) {
            console.error("Auth failed: No user found in cookies or header.")
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // 2. Initialize Service Role Client (for Admin operations)
        const supabaseService = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        // 3. Verify Ownership & Fetch Details
        const { data: order, error: fetchError } = await supabaseService
            .from('orders')
            .select(`
                *,
                order_items (
                    product_name,
                    quantity,
                    price
                )
            `)
            .eq('id', orderId)
            .single()

        if (fetchError || !order) {
            console.error("Fetch Error:", fetchError)
            const isServiceKeySet = !!process.env.SUPABASE_SERVICE_ROLE_KEY
            return NextResponse.json({
                error: `Order search failed: ${fetchError?.message || 'Order not found'}`,
                details: fetchError,
                receivedId: orderId,
                serviceKeySet: isServiceKeySet
            }, { status: 404 })
        }

        // Fetch profile separately to avoid "Missing Relationship" error
        const { data: profile } = await supabaseService
            .from('profiles')
            .select('username, email')
            .eq('id', order.user_id)
            .single()

        // Attach profile to order object for email logic
        order.profiles = profile



        if (order.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized to cancel this order' }, { status: 403 })
        }

        // 4. Send Cancellation Email to Admin
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'anasfahiem18@gmail.com'

        // Get Admin Emails
        const { data: adminUsers } = await supabaseService.rpc('is_admin_check', { user_id: user.id })

        // We will just send to the main configured ADMIN_EMAIL for simplicity and reliability with Gmail SMTP
        // sending to multiple bcc/cc might be flagged, so single admin email is safer for now.

        const itemsRows = order.order_items.map((item: any) => `
            <tr>
                <td style="padding: 8px;">${item.product_name}</td>
                <td style="padding: 8px;">x${item.quantity}</td>
            </tr>
        `).join('')


        const emailHtml = `
                <div style="font-family: sans-serif; background: #0F1113; color: #F0F2F5; padding: 20px;">
                <h2 style="color: #FFB02E;">⚠️ Cancellation Requested</h2>
                <p><strong>Customer:</strong> ${order.profiles?.username || 'Unknown'} (${order.profiles?.email || 'No Email'})</p>
                <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
                <p><strong>Total Value:</strong> EGP ${order.total}</p>
                <p>User has requested to cancel this order. Please review and approve in the Admin Dashboard.</p>
                <hr style="border-color: #333;" />
                <h3>Items:</h3>
                <table>${itemsRows}</table>
            </div>
        `

        await sendEmail({
            to: ADMIN_EMAIL,
            subject: `⚠️ Cancellation Requested #${order.id.slice(0, 8)}`,
            html: emailHtml
        })

        // 5. Update Order Status (Request Mode)
        const { error: updateError } = await supabaseService
            .from('orders')
            .update({ status: 'cancellation_requested' })
            .eq('id', orderId)

        if (updateError) {
            console.error("Update Error:", updateError)
            return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 })
        }

        return NextResponse.json({ success: true, status: 'cancellation_requested' })

    } catch (error: any) {
        console.error('Cancel Order Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
