"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

export function BackgroundEffects() {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return
            const { clientX, clientY } = e
            const x = clientX
            const y = clientY
            containerRef.current.style.setProperty("--mouse-x", `${x}px`)
            containerRef.current.style.setProperty("--mouse-y", `${y}px`)
        }

        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    return (
        <div
            ref={containerRef}
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        >
            {/* Corner Accents */}

            {/* Hidden Brand Words (Reveal on Hover) */}
            <div
                className="absolute inset-0 z-0"
                style={{
                    maskImage: "radial-gradient(circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)",
                    WebkitMaskImage: "radial-gradient(circle 250px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)",
                }}
            >
                <div className="absolute top-[15%] left-[10%] text-brand-red/20 font-heading text-4xl font-bold tracking-widest rotate-[-12deg]">PRECISION</div>
                <div className="absolute top-[25%] right-[15%] text-brand-red/20 font-heading text-2xl font-bold tracking-widest rotate-[6deg]">VELOCITY</div>
                {/* RECOIL Replaced by Logo */}
                <img src="/assets/logo-v5.png" alt="RECOIL" className="absolute bottom-[20%] left-[20%] h-24 w-auto opacity-10 rotate-0" />

                <div className="absolute top-[40%] left-[40%] text-brand-red/20 font-heading text-sm font-bold tracking-[0.5em]">CONTROL</div>
                <div className="absolute bottom-[35%] right-[25%] text-brand-red/20 font-heading text-3xl font-bold tracking-widest rotate-[-5deg]">ACCURACY</div>
                <div className="absolute top-[10%] right-[30%] text-brand-red/10 font-heading text-xl font-bold tracking-widest">SPEED</div>
                <div className="absolute bottom-[10%] left-[40%] text-brand-red/20 font-heading text-5xl font-bold tracking-tighter opacity-30 rotate-[3deg]">AIM</div>
                <div className="absolute top-[60%] right-[5%] text-brand-red/15 font-heading text-lg font-bold tracking-[1em] rotate-[90deg]">PERFORMANCE</div>
                <div className="absolute top-[50%] left-[5%] text-brand-red/15 font-heading text-xs font-bold tracking-[0.8em] rotate-[-90deg]">DOMINANCE</div>
            </div>

            {/* PlayStation Motifs (X and O) */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                {/* Hero Area / Top */}
                <CrossShape top="15%" left="15%" size={24} opacity={0.15} rotate={15} />
                <CircleShape top="20%" right="20%" size={32} opacity={0.1} />
                <CrossShape top="35%" right="10%" size={40} opacity={0.05} rotate={-10} />
                <CircleShape top="40%" left="8%" size={20} opacity={0.15} />

                {/* Lower / Shop Area */}
                <CircleShape top="65%" left="12%" size={48} opacity={0.05} />
                <CrossShape top="70%" right="15%" size={30} opacity={0.1} rotate={45} />
                <CircleShape bottom="15%" right="25%" size={24} opacity={0.1} />
                <CrossShape bottom="10%" left="30%" size={36} opacity={0.08} rotate={-20} />
            </div>

            {/* Grid Pattern with Spotlight Reveal */}
            <div
                className="absolute inset-0 opacity-[0.3]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #555 1px, transparent 1px),
            linear-gradient(to bottom, #555 1px, transparent 1px)
          `,
                    backgroundSize: "4rem 4rem",
                    maskImage: "radial-gradient(circle 400px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)",
                    WebkitMaskImage: "radial-gradient(circle 400px at var(--mouse-x, 50%) var(--mouse-y, 50%), black, transparent)",
                }}
            />

            {/* Static Grid (Faint but visible) */}
            <div
                className="absolute inset-0 opacity-[0.1]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, #999 1px, transparent 1px),
            linear-gradient(to bottom, #999 1px, transparent 1px)
          `,
                    backgroundSize: "4rem 4rem",
                }}
            />

            {/* Mouse Gloow/Flashlight Effect */}
            <div
                className="absolute inset-0 z-[-1] opacity-40"
                style={{
                    background: "radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(215, 38, 49, 0.25), transparent 40%)",
                }}
            />
        </div>
    )
}

function CrossShape({ top, left, right, bottom, size, opacity, rotate = 0 }: any) {
    return (
        <div
            className="absolute text-brand-red font-sans font-bold select-none"
            style={{
                top, left, right, bottom,
                opacity,
                fontSize: size,
                transform: `rotate(${rotate}deg)`
            }}
        >
            X
        </div>
    )
}

function CircleShape({ top, left, right, bottom, size, opacity }: any) {
    return (
        <div
            className="absolute border-2 border-brand-red rounded-full select-none"
            style={{
                top, left, right, bottom,
                opacity,
                width: size,
                height: size
            }}
        />
    )
}
