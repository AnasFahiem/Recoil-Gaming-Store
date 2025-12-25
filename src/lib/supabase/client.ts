
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock Client to prevent build crashes when Env Vars are missing
const mockClient = {
    auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null }, error: { message: "Build Mode: Missing Credentials" } }),
        signOut: async () => ({ error: null }),
        signUp: async () => ({ data: { user: null }, error: { message: "Build Mode: Missing Credentials" } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
    },
    from: (table: string) => {
        const queryBuilder = {
            select: () => queryBuilder,
            insert: () => queryBuilder,
            update: () => queryBuilder,
            delete: () => queryBuilder,
            eq: () => queryBuilder,
            neq: () => queryBuilder,
            gt: () => queryBuilder,
            lt: () => queryBuilder,
            gte: () => queryBuilder,
            lte: () => queryBuilder,
            in: () => queryBuilder,
            is: () => queryBuilder,
            like: () => queryBuilder,
            ilike: () => queryBuilder,
            contains: () => queryBuilder,
            range: () => queryBuilder,
            textSearch: () => queryBuilder,
            match: () => queryBuilder,
            not: () => queryBuilder,
            or: () => queryBuilder,
            filter: () => queryBuilder,
            order: () => queryBuilder,
            limit: () => queryBuilder,
            single: async () => ({ data: null, error: null }),
            maybeSingle: async () => ({ data: null, error: null }),
            // Handle count queries which return { count: number, data: ... }
            then: (resolve: any) => resolve({ data: [], count: 0, error: null })
        }
        return queryBuilder
    },
    storage: {
        from: (bucket: string) => ({
            upload: async () => ({ data: null, error: { message: "Build Mode: Missing Credentials" } }),
            getPublicUrl: (path: string) => ({ data: { publicUrl: "" } }),
            list: async () => ({ data: [], error: null }),
        })
    }
}

// Use real client if env vars exist, otherwise use mock (for builds without credentials)
if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase Environment Variables Missing! Using Mock Client. Data will be null.')
    console.log('URL:', supabaseUrl, 'Key:', supabaseAnonKey ? 'Found' : 'Missing')
}

export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : (mockClient as any)
