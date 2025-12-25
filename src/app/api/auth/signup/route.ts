import { NextResponse } from 'next/server'
import { supabaseAdmin, isAdminConfigured } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/send-mail'

export async function POST(request: Request) {
    if (!isAdminConfigured()) {
        console.error("ADMIN ERROR: Supabase Service Role Key missing.")
        return NextResponse.json({ error: "System configuration error." }, { status: 500 })
    }

    try {
        const { email, password, username } = await request.json()

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
        }

        // 1. Create User (Confirm off to allow manual email sending)
        const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: false, // We will handle confirmation manually
            user_metadata: { username }
        })

        if (createError) {
            console.error("Signup Create Error:", createError)
            return NextResponse.json({ error: createError.message }, { status: 400 })
        }

        if (!user.user) {
            return NextResponse.json({ error: "Failed to create user." }, { status: 500 })
        }


        // Helper to determine the best base URL
        const getBaseUrl = () => {
            // Priority 1: Explicit Site URL (Set in Vercel Env)
            if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL

            // Priority 2: Vercel System URL
            if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`

            const origin = request.headers.get('origin')

            // Priority 3: Origin (But strictly validated for Production)
            if (process.env.NODE_ENV === 'production') {
                // In production, NEVER return localhost even if the header says so (e.g. from a proxy)
                if (origin && !origin.includes('localhost')) {
                    return origin
                }
                // If we are in production but have no valid env vars and origin is localhost, 
                // something is widely misconfigured, but we fallback to Vercel URL if possible or just stay safe.
                return `https://${process.env.VERCEL_URL || 'recoil.vercel.app'}`
            }

            // Development fallback
            return origin || 'http://localhost:3000'
        }

        const baseUrl = getBaseUrl()

        // 2. Generate Confirmation Link
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email,
            password, // Required for signup type
            options: {
                redirectTo: `${baseUrl}/login`
            }
        })

        if (linkError || !linkData.properties?.action_link) {
            console.error("Link Gen Error:", linkError)
            // User is created, but email failed.
            return NextResponse.json({
                error: "User created, but failed to generate confirmation link. Please contact support."
            }, { status: 500 })
        }

        const confirmationLink = linkData.properties.action_link

        // 3. Send Email via Gmail SMTP
        const emailHtml = `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #0F1113; color: #fff;">
                <h1 style="color: #D72631; text-align: center;">Welcome to RECOIL</h1>
                <p>Hello ${username || 'Agent'},</p>
                <p>Thank you for joining the ranks. Verify your email to activate your account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${confirmationLink}" style="background: #D72631; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Confirm Account</a>
                </div>
                <p style="color: #666; font-size: 12px; text-align: center;">If you didn't create this account, you can ignore this email.</p>
            </div>
        `

        const emailResult = await sendEmail({
            to: email,
            subject: "Confirm your RECOIL Account",
            html: emailHtml
        })

        if (!emailResult.success) {
            console.error("Email Send Error:", emailResult.error)
            // Soft error: User created, link generated, but email failed.
            // Ideally we should rollback or return specific error, but for now we inform user
            return NextResponse.json({ error: "Account created but email failed to send." }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error("Signup API Error:", error)
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 })
    }
}
