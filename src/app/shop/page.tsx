import { createClient } from "@/lib/supabase/server"
import { parseProductImages } from "@/lib/utils"
import { ShopPageContent } from "@/components/pages/shop-page-content"

export const dynamic = 'force-dynamic'
export const revalidate = 60 // Cache for 60 seconds (ISR)

export default async function ShopPage() {
    const supabase = createClient()

    // Server-Side Parallel Fetching
    const [productsResponse, bundlesResponse] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('bundles').select('*, bundle_items(product:products(image))')
    ])

    const products = productsResponse.data || []
    const bundlesData = bundlesResponse.data || []

    // Process bundles (Server Side)
    const processedBundles = bundlesData.map((bundle: any) => {
        let images = parseProductImages(bundle.image)

        if (bundle.bundle_items && bundle.bundle_items.length > 0) {
            const innerImages = bundle.bundle_items.flatMap((item: any) => parseProductImages(item.product?.image))

            // Fallback: If bundle has no main image, uses inner images logic 
            // (Note: logic kept simple here as we primarily want to pass innerImages)

            return { ...bundle, innerImages }
        }
        return { ...bundle, innerImages: [] }
    })

    return <ShopPageContent products={products} bundles={processedBundles} />
}
