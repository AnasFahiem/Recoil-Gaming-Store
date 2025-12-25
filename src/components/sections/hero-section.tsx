"use client"

import NextImage from "next/image"

import { useRef } from "react"
import { motion, useMotionValue, useMotionTemplate } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Container } from "@/components/ui/container"
import { Logo } from "@/components/ui/logo"
import Link from "next/link"
import { ArrowRight, ChevronRight } from "lucide-react"
import { AuthButtons } from "@/components/features/auth-buttons"
import { useLanguage } from "@/contexts/language-context"

export function HeroSection() {
    const { t } = useLanguage()
    const ref = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    const trailBackground = useMotionTemplate`radial-gradient(600px circle at ${mouseX}px ${mouseY}px, rgba(215, 38, 49, 0.15), transparent 80%)`

    return (
        <section
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
            onMouseMove={handleMouseMove}
            ref={ref}
        >
            {/* Dynamic Background */}
            <div className="absolute inset-0 bg-brand-black z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-brand-red/5 rounded-full blur-3xl opacity-50 animate-pulse" />
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-brand-silver/5 rounded-full blur-3xl opacity-30" />
            </div>

            {/* Interactive Trail Layer */}
            <motion.div
                className="absolute inset-0 z-0 pointer-events-none"
                style={{ background: trailBackground }}
            />

            <Container className="relative z-10 flex flex-col items-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                >
                    {/* Badge */}
                    <Link href="/shop?category=Mousepad">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand-white/10 bg-brand-white/5 backdrop-blur-md mb-8 hover:bg-brand-white/10 hover:border-brand-red/50 transition-colors cursor-pointer"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-red opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-red"></span>
                            </span>
                            <span className="text-xs font-heading font-semibold tracking-widest text-brand-silver uppercase">
                                {t.hero.badge}
                            </span>
                        </motion.div>
                    </Link>

                    {/* Prominent Logo Display */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="mb-8 flex justify-center w-full"
                    >
                        <div className="relative h-32 md:h-48 lg:h-56 w-full mb-8 flex justify-center">
                            <NextImage
                                src="/recoil_logo_hero.png"
                                alt="RECOIL Official Logo"
                                fill
                                priority
                                className="object-contain drop-shadow-[0_0_25px_rgba(215,38,49,0.3)]"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                        </div>
                    </motion.div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-8xl lg:text-[10rem] font-heading font-black tracking-tighter text-brand-white leading-[0.85] mb-8 mix-blend-screen">
                        {t.hero.headline} <br className="hidden md:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-white via-brand-white to-brand-silver/40 pr-2">
                            {t.hero.subheadline}
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="max-w-xl mx-auto text-lg md:text-xl text-brand-silver/80 font-body leading-relaxed mb-12">
                        {t.hero.description}
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                        <Link href="/shop" className="relative z-30">
                            <Button size="lg" className="h-14 px-8 text-base group relative overflow-hidden">
                                <span className="relative z-10 flex items-center gap-2">
                                    {t.hero.ctaShop} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                                <motion.div
                                    className="absolute inset-0 bg-brand-white mix-blend-overlay"
                                    initial={{ x: '-100%' }}
                                    whileHover={{ x: '100%' }}
                                    transition={{ duration: 0.5 }}
                                />
                            </Button>
                        </Link>

                        <Link href="/technology" className="relative z-30">
                            <Button size="lg" variant="outline" className="h-14 px-8 text-base group">
                                <span className="flex items-center gap-2">
                                    {t.hero.ctaTech} <ChevronRight className="w-4 h-4 text-brand-silver group-hover:text-brand-white transition-colors" />
                                </span>
                            </Button>
                        </Link>
                    </div>

                    {/* Auth Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8 pt-8 border-t border-brand-white/10">
                        <AuthButtons />
                    </div>
                </motion.div>
            </Container>

            {/* 3D Abstract Element - Fixed z-index and pointer-events */}
            <div className="absolute bottom-0 left-0 w-full h-[30vh] bg-gradient-to-t from-brand-black via-brand-black/80 to-transparent z-0 pointer-events-none" />


        </section>
    )
}
