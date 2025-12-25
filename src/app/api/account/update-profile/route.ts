import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        const { username, phone } = await request.json();

        // Get current user from auth header
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updates: any = {};

        // 1. Handle Username
        if (username !== undefined) {
            if (typeof username !== 'string') {
                return NextResponse.json({ error: 'Username must be a string' }, { status: 400 });
            }

            // Validate username format (if not empty - though typically required)
            // Assuming strict overwrite if provided
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            if (!usernameRegex.test(username)) {
                return NextResponse.json({
                    error: 'Username must be 3-20 characters (letters, numbers, underscores only)'
                }, { status: 400 });
            }

            // Check uniqueness if changed
            // First get current
            const { data: currentProfile } = await supabaseAdmin.from('profiles').select('username').eq('id', user.id).single();

            if (!currentProfile || currentProfile.username !== username) {
                const { data: existing } = await supabaseAdmin
                    .from('profiles')
                    .select('id')
                    .eq('username', username)
                    .neq('id', user.id)
                    .single();

                if (existing) {
                    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
                }
            }
            updates.username = username;
        }

        // 2. Handle Phone
        if (phone !== undefined) {
            // Basic phone validation (optional, can be lenient)
            if (typeof phone !== 'string') {
                return NextResponse.json({ error: 'Phone must be a string' }, { status: 400 });
            }
            updates.phone = phone;
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ success: true, message: 'No changes' });
        }

        updates.updated_at = new Date().toISOString();

        // Update Profile
        const { error: updateError } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, updates });

    } catch (error: any) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
