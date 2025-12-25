import { createClient } from "@/lib/supabase/server"
import { parseProductImages } from "@/lib/utils"
import { ProductPageContent } from "@/components/pages/product-page-content"

export const dynamic = 'force-dynamic'
export const revalidate = 60

export default async function ProductPage({ params }: { params: { slug: string } }) {
    const supabase = createClient()

    // Parallel Fetch (Server Side Is Fast)
    const [productResponse, bundleResponse] = await Promise.all([
        supabase.from('products').select('*').eq('id', params.slug).single(),
        supabase.from('bundles').select('*').eq('id', params.slug).single()
    ])

    let product = productResponse.data
    const bundleData = bundleResponse.data

    // If it's a bundle, fetch items and normalize
    if (!product && bundleData) {
        const { data: itemsData } = await supabase
            .from('bundle_items')
            .select('quantity, product:products(id, name, image)')
            .eq('bundle_id', params.slug)

        let finalImage = bundleData.image
        let bundleItems: any[] = []

        if (itemsData) {
            bundleItems = itemsData.map((item: any) => ({
                ...item.product,
                quantity: item.quantity
            }))

            if (!finalImage && bundleItems.length > 0) {
                const firstImg = parseProductImages(bundleItems[0].image)
                finalImage = firstImg[0]
            }
        }

        let allBundleImages: string[] = []
        if (finalImage) allBundleImages.push(finalImage)

        if (bundleItems) {
            bundleItems.forEach((item: any) => {
                const itemImgs = parseProductImages(item.image)
                if (itemImgs.length > 0) allBundleImages.push(...itemImgs)
            })
        }

        product = {
            ...bundleData,
            image: Array.from(new Set(allBundleImages)),
            category: 'Bundle',
            bundleItems: bundleItems
        }
    }

    return <ProductPageContent product={product} />
}
