
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const envVars: Record<string, string> = {}

envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
        envVars[key.trim()] = value.trim()
    }
})

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL']
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY']

if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Env Vars")
    console.log("Keys found:", Object.keys(envVars))
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkUser() {
    const email = "anas.elkholy.soc@gmail.com"
    console.log(`Checking for user: ${email}`)

    // 1. Check Auth Users
    const { data: { users }, error } = await supabase.auth.admin.listUsers()

    if (error) {
        console.error("Error listing users:", error)
        return
    }

    const foundUser = users.find(u => u.email === email)

    if (foundUser) {
        console.log("✅ User FOUND in Auth:")
        console.log("- ID:", foundUser.id)
        console.log("- Email:", foundUser.email)
        console.log("- Created:", foundUser.created_at)
        console.log("- Confirmed:", foundUser.email_confirmed_at)
    } else {
        console.log("❌ User NOT FOUND in Auth users list.")
    }

    // 2. Check Profiles
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single()

    if (profile) {
        console.log("✅ User FOUND in public.profiles:")
        console.log(profile)
    } else {
        console.log("❌ User NOT FOUND in public.profiles.")
    }
}

checkUser()
