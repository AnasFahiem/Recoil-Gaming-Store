"use client"

import { MessageCircle } from "lucide-react"

export function WhatsAppButton() {
    return (
        <a
            href="https://wa.me/qr/AXJQ6YBW6SEZD1"
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl group"
            aria-label="Contact Support on WhatsApp"
        >
            <MessageCircle className="h-8 w-8 fill-current" />
            <span className="absolute right-full mr-4 w-max rounded bg-brand-black/90 px-3 py-1 text-sm text-white opacity-0 transition-opacity group-hover:opacity-100 border border-brand-white/10">
                Chat with Support
            </span>
        </a>
    )
}
