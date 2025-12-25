"use client"

import { ProductCard } from "@/components/features/product-card"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { NewsletterForm } from "@/components/features/newsletter-form"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

interface HomePageContentProps {
    products: any[]
}

export function HomePageContent({ products }: HomePageContentProps) {
    const { t } = useLanguage()

    return (
        <section className="py-32 border-t border-brand-white/5 bg-brand-black relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-red/5 blur-[120px] rounded-full pointer-events-none" />

            <Container className="relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
                    <div>
                        <h2 className="text-4xl md:text-6xl font-heading font-bold mb-6 uppercase text-brand-white tracking-tight">
                            {t.home.featured} <span className="text-brand-red">{t.home.gear}</span>
                        </h2>
                        <p className="text-brand-silver text-lg max-w-md leading-relaxed">
                            {t.home.description}
                        </p>
                    </div>
                    <Link href="/shop">
                        <Button variant="link" className="text-brand-white gap-2 text-lg">
                            {t.home.viewAll} <ArrowRight className="w-5 h-5 rtl:rotate-180" />
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            title={product.name}
                            price={product.price}
                            category={product.category}
                            image={product.image}
                            isNew={Math.random() < 0.3} // Random 'New' tag for visual testing
                        />
                    ))}
                </div>

                <div id="newsletter" className="mt-24 p-12 rounded-sm border border-brand-white/10 bg-brand-surface-subtle/50 backdrop-blur-sm relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-red/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                        <h3 className="text-3xl font-heading font-bold text-brand-white mb-4 uppercase">{t.home.joinTitle}</h3>
                        <p className="text-brand-silver mb-8">{t.home.joinDesc}</p>
                        <NewsletterForm />
                    </div>
                </div>

            </Container>
        </section>
    )
}
