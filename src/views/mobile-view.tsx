
import { HeroSection } from "@/components/sections/hero-section";
// We will likely create a distinct MobileHomePageContent later
import { HomePageContent } from "@/components/pages/home-page-content";

interface MobileViewProps {
    products: any[];
}

export function MobileView({ products }: MobileViewProps) {
    return (
        <main className="flex min-h-screen flex-col selection:bg-brand-red selection:text-white pb-20">
            {/* 
                MOBILE SPECIFIC HEADER 
                This helps us verify the switch is working
            */}
            <div className="bg-brand-red/10 border-b border-brand-red/20 p-2 text-center text-xs text-brand-red font-mono uppercase tracking-widest">
                Mobile Version Active
            </div>

            {/* Reusing existing components for now, but wrapped in mobile container styles if needed */}
            <HeroSection />

            <div className="px-4">
                <HomePageContent products={products} />
            </div>

            {/* Added extra padding/safe area for mobile nav usually */}
        </main>
    )
}
