"use client"

import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Layers, Zap, Shield } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export default function TechnologyPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen pt-24 pb-24">
            <Container>
                <div className="max-w-4xl mx-auto text-center mb-16">
                    <Typography variant="h1" className="text-brand-white mb-6">
                        {t.technology.title} <span className="text-brand-red">{t.technology.zeroDrift}</span>
                    </Typography>
                    <p className="text-xl text-brand-silver leading-relaxed">
                        {t.technology.description}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
                    <div className="bg-brand-surface-subtle p-8 rounded-sm border border-brand-white/5">
                        <Layers className="w-12 h-12 text-brand-red mb-6" />
                        <h3 className="text-2xl font-heading font-bold text-brand-white mb-4">{t.technology.multiLayerTitle}</h3>
                        <p className="text-brand-silver">
                            {t.technology.multiLayerDesc}
                        </p>
                    </div>
                    <div className="bg-brand-surface-subtle p-8 rounded-sm border border-brand-white/5">
                        <Zap className="w-12 h-12 text-brand-red mb-6" />
                        <h3 className="text-2xl font-heading font-bold text-brand-white mb-4">{t.technology.nanoTextureTitle}</h3>
                        <p className="text-brand-silver">
                            {t.technology.nanoTextureDesc}
                        </p>
                    </div>
                    <div className="bg-brand-surface-subtle p-8 rounded-sm border border-brand-white/5">
                        <Shield className="w-12 h-12 text-brand-red mb-6" />
                        <h3 className="text-2xl font-heading font-bold text-brand-white mb-4">{t.technology.diamondEdgeTitle}</h3>
                        <p className="text-brand-silver">
                            {t.technology.diamondEdgeDesc}
                        </p>
                    </div>
                </div>

                <div className="text-center bg-brand-surface-subtle/30 p-12 rounded-sm border border-brand-white/10">
                    <h2 className="text-3xl font-heading font-bold text-brand-white mb-6">{t.technology.readyToUpgrade}</h2>
                    <Link href="/shop">
                        <Button size="lg" className="h-14 px-8">
                            {t.technology.shopSeries} <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </div>
            </Container>
        </div>
    )
}
