import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/send-mail';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            );
        }

        // For now, just log the email (will work without any setup)
        console.log('Newsletter signup:', email, new Date().toISOString());

        // Insert into Supabase 'newsletter_subscribers' table
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (supabaseUrl && supabaseKey) {
            const { createClient } = await import('@supabase/supabase-js')
            const supabase = createClient(supabaseUrl, supabaseKey)

            const { error } = await supabase
                .from('newsletter_subscribers')
                .insert([{ email, created_at: new Date().toISOString() }])

            if (error) {
                console.error('Supabase error:', error)
                // Don't fail the request, just log it (unless we want to show it to user)
            }
        }

        // Try sending email if Gmail is configured (Optional)
        // Simplistic check: If we have the code running, we assume ENV vars are there or sendEmail handles error gracefully.

        try {
            await sendEmail({
                to: email,
                subject: 'Welcome to the RECOIL Squadron',
                html: `
                    <div style="font-family: sans-serif; background: #0F1113; color: #F0F2F5; padding: 20px; border: 1px solid #333;">
                        <h2 style="color: #D72631;">Welcome to the Squadron.</h2>
                        <p>Agent ${email},</p>
                        <p>You have successfully subscribed to the RECOIL newsletter. Expect briefings on new gear and mission updates.</p>
                        <p style="color: #666; font-size: 12px; margin-top: 20px;">RECOIL Command</p>
                    </div>
                `
            })
        } catch (error) {
            console.error('Email send error:', error);
        }

        return NextResponse.json({
            success: true,
            message: 'Welcome to the Squadron!'
        });
    } catch (error) {
        console.error('Newsletter error:', error);
        return NextResponse.json(
            { error: 'Failed to subscribe.' },
            { status: 500 }
        );
    }
}
