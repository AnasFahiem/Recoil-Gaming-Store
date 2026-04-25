'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Email and password are required.' }
    }

    const supabase = createClient()

    // 1. Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (authError) {
        console.error('Sign in error:', authError)
        // Translate common Supabase error messages
        if (authError.message.includes('Invalid login credentials')) {
            return { error: 'Wrong email or password. Please try again.' }
        } else if (authError.message.includes('Email not confirmed')) {
            return { error: 'Please confirm your email before signing in. Check your inbox.' }
        } else if (authError.message.includes('Too many requests')) {
            return { error: 'Too many attempts. Please wait a moment and try again.' }
        } else {
            return { error: authError.message || 'Sign in failed. Please try again.' }
        }
    }

    if (!authData?.user) {
        return { error: 'Sign in failed. No user data returned — please try again.' }
    }

    // 2. Fetch role from DB
    let role = 'USER'
    try {
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authData.user.id)
            .single()

        if (profileError) {
            console.warn('Profile fetch warning:', profileError.message)
        } else if (profile?.role) {
            role = profile.role
        }
    } catch (profileErr: any) {
        console.warn('Profile fetch failed (defaulting to USER):', profileErr.message)
    }

    // 3. Redirect based on role
    // Using redirect() throws an error that Next.js catches to handle the redirection.
    // It must be called outside of try/catch blocks that would catch its internal thrown error.
    if (role === 'ADMIN') {
        redirect('/admin')
    } else {
        redirect('/')
    }
}
