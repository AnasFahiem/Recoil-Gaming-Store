
import { supabase } from "@/lib/supabase/client";
import { headers } from "next/headers";
import { DesktopView } from "@/views/desktop-view";
import { MobileView } from "@/views/mobile-view";

export const revalidate = 3600 // Revalidate every hour

export default async function Home() {
    // 1. Device Detection
    const headersList = headers();
    const deviceType = headersList.get('x-device-type') || 'desktop';
    const isMobile = deviceType === 'mobile';

    // 2. Data Fetching (Shared)
    let featuredProducts: any[] = [];
    if (supabase) {
        const { data } = await supabase
            .from('products')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(4);

        if (data) featuredProducts = data;
    }

    // 3. Conditional Rendering
    if (isMobile) {
        return <MobileView products={featuredProducts} />;
    }

    return <DesktopView products={featuredProducts} />;
}
