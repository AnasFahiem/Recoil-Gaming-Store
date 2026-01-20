"use client"

import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"

export default function CreatorsPage() {
    const { t } = useLanguage()

    return (
        <div className="min-h-screen pt-24 pb-12">
            <Container>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
                    <Typography variant="h1" className="text-brand-white">
                        {t.creators.joinTitle} <span className="text-brand-red">{t.creators.squadron}</span>
                    </Typography>
                    <p className="text-brand-silver max-w-2xl text-lg">
                        {t.creators.description}
                    </p>
                    <div className="p-8 border border-dashed border-brand-white/10 rounded-lg bg-brand-white/5">
                        <Typography variant="h3" className="text-brand-white mb-4">{t.creators.programTitle}</Typography>
                        <p className="text-brand-silver mb-6">{t.creators.programDesc}</p>
                        <Link href="/signup">
                            <Button size="lg">{t.creators.cta}</Button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    )
}
