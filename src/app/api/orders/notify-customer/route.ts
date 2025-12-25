import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/send-mail'

export async function POST(request: Request) {
    try {
        const { orderId, newStatus } = await request.json()

        if (!orderId || !newStatus) {
            return NextResponse.json(
                { error: 'Order ID and status are required' },
                { status: 400 }
            )
        }

        // Initialize Supabase
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl) {
            console.error('Missing NEXT_PUBLIC_SUPABASE_URL')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        // Fallback to Anon key for basic DB ops, but Admin ops will fail if Service Key is missing
        const supabaseKeyToUse = supabaseServiceKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        const supabase = createClient(supabaseUrl, supabaseKeyToUse!)

        // Fetch order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select(`
                id,
                customer_email,
                total,
                status,
                shipping_address,
                created_at,
                order_items (
                    product_name,
                    quantity,
                    price
                )
            `)
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            console.error('Order fetch error:', orderError)
            return NextResponse.json({ error: 'Order not found' }, { status: 404 })
        }

        // --- DYNAMIC EMAIL CONTENT GENERATION ---

        const shippingAddr = order.shipping_address
        const addressText = `
            ${shippingAddr?.name || 'Valued Customer'}<br/>
            ${shippingAddr?.phone ? `${shippingAddr.phone}<br/>` : ''}
            ${shippingAddr?.line1 || ''} ${shippingAddr?.line2 || ''}<br/>
            ${shippingAddr?.city || ''}, ${shippingAddr?.state || ''} ${shippingAddr?.zip || ''}<br/>
            ${shippingAddr?.country || ''}
        `.trim()

        const generateItemsRow = (items: any[]) => items.map(item => `
            <tr style="border-bottom: 1px solid #333;">
                <td style="padding: 12px; color: #F0F2F5;">${item.product_name}</td>
                <td style="padding: 12px; color: #F0F2F5; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; color: #F0F2F5; text-align: right;">EGP ${item.price.toLocaleString()}</td>
            </tr>
        `).join('')


        // Template Helpers
        const getEmailSubject = (status: string, id: string) => {
            const shortId = id.slice(0, 8).toUpperCase()
            switch (status) {
                case 'Shipped': return `✈️ Your Order #${shortId} is on the way!`
                case 'Delivered': return `📦 Your Order #${shortId} has arrived!`
                case 'Cancelled': return `Order #${shortId} has been Cancelled`
                case 'Processing': return `Order Confirmation #${shortId}`
                default: return `Update on Order #${shortId}`
            }
        }

        const getStatusMessage = (status: string) => {
            switch (status) {
                case 'Shipped': return "Great news! Your gear has been dispatched and is making its way to you. Coordinates locked in."
                case 'Delivered': return "Mission complete. Your gear has arrived. Time to upgrade your setup."
                case 'Cancelled': return "This order has been cancelled. If you didn't request this, please contact support immediately."
                case 'Processing': return "Thank you for your order. We've received it and are currently processing it."
                default: return `Your order status has been updated to: <strong>${status}</strong>`
            }
        }

        // 1. CUSTOMER EMAIL TEMPLATE (Dynamic)
        const customerEmailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1113; color: #F0F2F5; border: 1px solid #333;">
                <div style="padding: 30px; text-align: center; border-bottom: 1px solid #333;">
                    <h1 style="color: #FFFFFF; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -1px;">RECOIL</h1>
                </div>

                <div style="background: #1a1c1e; padding: 20px; text-align: center; border-bottom: 1px solid #333;">
                    <p style="color: #9ca3af; margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Order Status</p>
                    <h2 style="color: #D72631; margin: 5px 0 0 0; font-size: 24px;">${newStatus}</h2>
                </div>

                <div style="padding: 30px;">
                    <p style="margin-bottom: 20px; line-height: 1.6;">Hello,</p>
                    <p style="margin-bottom: 30px; line-height: 1.6; color: #9ca3af;">
                        ${getStatusMessage(newStatus)}
                    </p>

                    <h3 style="color: #FFFFFF; font-size: 16px; margin-bottom: 15px;">Order Summary <span style="color: #525252;">#${order.id.slice(0, 8)}</span></h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px; margin-bottom: 30px;">
                        <tbody>
                            ${generateItemsRow(order.order_items)}
                            <tr style="border-top: 2px solid #333;">
                                <td colspan="2" style="padding: 15px 12px; text-align: right; color: #9ca3af;">Total</td>
                                <td style="padding: 15px 12px; text-align: right; color: #D72631; font-weight: bold; font-size: 16px;">EGP ${order.total.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                     <div style="background: #1a1c1e; padding: 20px; border-radius: 4px;">
                        <p style="color: #9ca3af; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Shipping To</p>
                        <p style="margin: 0; line-height: 1.5;">${addressText}</p>
                    </div>
                </div>

                <div style="padding: 40px 20px; text-align: center; border-top: 1px solid #333;">
                    <p style="color: #525252; font-size: 12px; margin-bottom: 10px;">RECOIL | Premium Gaming Mousepads</p>
                    <a href="https://recoil.gg" style="color: #D72631; text-decoration: none; font-size: 12px;">Visit Store</a>
                </div>
            </div>
        `

        // 2. ADMIN EMAIL TEMPLATE (Only for New Orders)
        const adminEmailHtml = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1113; color: #F0F2F5; border: 1px solid #333;">
                <div style="background: #D72631; padding: 20px; text-align: center;">
                    <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">New Order Received</h1>
                </div>
                <div style="padding: 30px;">
                    <div style="margin-bottom: 30px; border-left: 4px solid #D72631; padding-left: 15px;">
                        <p style="color: #9ca3af; margin: 0 0 5px 0; font-size: 14px;">Order Reference</p>
                        <h2 style="margin: 0; font-size: 20px; color: #FFFFFF;">#${order.id.slice(0, 8).toUpperCase()}</h2>
                    </div>

                    <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                        <div>
                            <p style="color: #9ca3af; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Customer</p>
                            <p style="margin: 0; font-weight: bold;">${shippingAddr?.name || 'Guest'}</p>
                            <p style="margin: 0; font-size: 14px; color: #9ca3af;">${order.customer_email}</p>
                        </div>
                        <div style="text-align: right;">
                            <p style="color: #9ca3af; margin: 0 0 5px 0; font-size: 12px; text-transform: uppercase;">Total Amount</p>
                            <p style="margin: 0; font-size: 18px; color: #D72631; font-weight: bold;">EGP ${order.total.toLocaleString()}</p>
                        </div>
                    </div>

                    <h3 style="color: #D72631; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 0;">Order Details</h3>
                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background: #1a1c1e;">
                                <th style="padding: 10px; text-align: left; color: #9ca3af;">Item</th>
                                <th style="padding: 10px; text-align: center; color: #9ca3af;">Qty</th>
                                <th style="padding: 10px; text-align: right; color: #9ca3af;">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${generateItemsRow(order.order_items)}
                        </tbody>
                    </table>
                </div>
            </div>
        `

        // --- EXECUTION ---

        const emailPromises = []
        const customerSubject = getEmailSubject(newStatus, order.id)

        // 1. Send Customer Email
        emailPromises.push(
            sendEmail({
                to: order.customer_email,
                subject: customerSubject,
                html: customerEmailHtml,
            })
        )

        // 2. Send Admin Email (Only Trigger on initial 'Processing')
        if (newStatus === 'Processing') {
            // Fetch Admins
            let adminEmails: string[] = []
            try {
                const { data: adminProfiles } = await supabase
                    .from('profiles')
                    .select('id')
                    .eq('role', 'ADMIN')

                if (adminProfiles && adminProfiles.length > 0) {
                    const adminIds = adminProfiles.map(p => p.id)
                    const { data: { users }, error: authError } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
                    if (!authError && users) {
                        adminEmails = users.filter(u => adminIds.includes(u.id) && u.email).map(u => u.email!)
                    }
                }
            } catch (e) {
                console.error('Admin fetch fail', e)
            }

            if (adminEmails.length === 0) adminEmails = ['anasfahiem18@gmail.com'] // Fallback

            // Dedup
            const uniqueAdmins = Array.from(new Set(adminEmails))

            uniqueAdmins.forEach(email => {
                emailPromises.push(
                    sendEmail({
                        to: email,
                        subject: `🚨 New Order #${order.id.slice(0, 8)} (EGP ${order.total})`,
                        html: adminEmailHtml,
                    })
                )
            })
        }

        const results = await Promise.all(emailPromises)
        const allOk = results.every(r => r.success)

        if (!allOk) console.error('Some emails failed', results)

        return NextResponse.json({
            success: true,
            message: 'Notifications processed',
            emailsSent: results.length
        })

    } catch (error: any) {
        console.error('Notification error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        )
    }
}
