import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendEmail } from '@/lib/send-mail'

export async function POST(request: Request) {
    try {
        const { orderId } = await request.json()

        if (!orderId) {
            return NextResponse.json(
                { error: 'Order ID is required' },
                { status: 400 }
            )
        }

        // Initialize Supabase with service role key for admin access
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase credentials')
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Fetch order details with items
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



        // Send email using Gmail SMTP
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'anasfahiem18@gmail.com'

        // Format order items for email
        const itemsList = order.order_items
            .map((item: any) => `• ${item.quantity}x ${item.product_name} @ $${item.price}`)
            .join('\n')

        const shippingAddr = order.shipping_address
        const addressText = `${shippingAddr.name}\n${shippingAddr.address}\n${shippingAddr.city}, ${shippingAddr.zip}${shippingAddr.phone ? `\nPhone: ${shippingAddr.phone}` : ''}`

        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0F1113; color: #F0F2F5; padding: 20px; border: 1px solid #D72631;">
                <h1 style="color: #D72631; border-bottom: 2px solid #D72631; padding-bottom: 10px;">New Order Received</h1>
                
                <div style="background: #1a1c1e; padding: 15px; margin: 20px 0; border-left: 3px solid #D72631;">
                    <h2 style="color: #F0F2F5; margin-top: 0;">Order #${order.id.slice(0, 8)}</h2>
                    <p style="color: #9ca3af; margin: 5px 0;">Date: ${new Date(order.created_at).toLocaleString()}</p>
                    <p style="color: #9ca3af; margin: 5px 0;">Status: ${order.status}</p>
                </div>

                <h3 style="color: #D72631;">Customer Information</h3>
                <p style="line-height: 1.6;">
                    <strong>Email:</strong> ${order.customer_email}<br/>
                    <strong>Name:</strong> ${shippingAddr.name}
                </p>

                <h3 style="color: #D72631;">Order Items</h3>
                <div style="background: #1a1c1e; padding: 15px; margin: 10px 0;">
                    ${order.order_items.map((item: any) => `
                        <div style="padding: 10px 0; border-bottom: 1px solid #333;">
                            <strong>${item.quantity}x ${item.product_name}</strong><br/>
                            <span style="color: #9ca3af;">$${item.price} each</span>
                        </div>
                    `).join('')}
                </div>

                <h3 style="color: #D72631;">Shipping Address</h3>
                <div style="background: #1a1c1e; padding: 15px; margin: 10px 0;">
                    <pre style="margin: 0; color: #F0F2F5; font-family: monospace;">${addressText}</pre>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #D72631; text-align: center;">
                    <h2 style="color: #D72631; margin: 0;">Total: $${order.total}</h2>
                </div>

                <p style="text-align: center; color: #9ca3af; margin-top: 30px; font-size: 12px;">
                    RECOIL | Premium Gaming Mousepads
                </p>
            </div>
        `

        const result = await sendEmail({
            to: ADMIN_EMAIL,
            subject: `🎯 New Order #${order.id.slice(0, 8)} - $${order.total}`,
            html: emailHtml
        })

        if (!result.success) {
            console.warn("Failed to send admin email notification", result.error)
            // We don't throw, just log. Order is already created.
        }

        return NextResponse.json({
            success: true,
            message: 'Order notification processed'
        })

    } catch (error: any) {
        console.error('Order notification error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to send notification' },
            { status: 500 }
        )
    }
}
