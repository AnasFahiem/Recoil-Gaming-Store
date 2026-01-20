
import { HeroSection } from "@/components/sections/hero-section";
import { HomePageContent } from "@/components/pages/home-page-content";

interface DesktopViewProps {
    products: any[];
}

export function DesktopView({ products }: DesktopViewProps) {
    return (
        <main className="flex min-h-screen flex-col selection:bg-brand-red selection:text-white">
            <HeroSection />
            <HomePageContent products={products} />
        </main>
    )
}
