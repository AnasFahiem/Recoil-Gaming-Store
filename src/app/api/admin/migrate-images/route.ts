import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
    try {
        // Initialize Supabase with service role key
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

        if (!supabaseUrl || !supabaseServiceKey) {
            return NextResponse.json({ error: 'Missing Supabase credentials' }, { status: 500 })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        // Step 1: Get all products
        const { data: products, error: fetchError } = await supabase
            .from('products')
            .select('id, image')

        if (fetchError) {
            console.error('Fetch error:', fetchError)
            return NextResponse.json({ error: fetchError.message }, { status: 500 })
        }

        let migrated = 0
        let skipped = 0

        // Step 2: Update each product
        for (const product of products || []) {
            let newImageValue

            if (!product.image) {
                newImageValue = []
            } else if (Array.isArray(product.image)) {
                // Already an array, skip
                skipped++
                continue
            } else if (typeof product.image === 'string') {
                // Convert string to array
                try {
                    // Try parsing as JSON first (in case it's a JSON string)
                    newImageValue = JSON.parse(product.image)
                    if (!Array.isArray(newImageValue)) {
                        newImageValue = [product.image]
                    }
                } catch {
                    // Not JSON, treat as single URL
                    newImageValue = [product.image]
                }
            } else {
                newImageValue = []
            }

            // Update the product
            const { error: updateError } = await supabase
                .from('products')
                .update({ image: newImageValue })
                .eq('id', product.id)

            if (updateError) {
                console.error(`Error updating product ${product.id}:`, updateError)
            } else {
                migrated++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Migration complete! Migrated: ${migrated}, Skipped: ${skipped}`,
            migrated,
            skipped
        })

    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json(
            { error: error.message || 'Migration failed' },
            { status: 500 }
        )
    }
}
