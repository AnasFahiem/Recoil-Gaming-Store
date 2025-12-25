"use client"

import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { ChevronDown, Check, Globe } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export function LanguageSwitcher({ direction = 'down' }: { direction?: 'up' | 'down' }) {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = () => setIsOpen(!isOpen)

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="sm"
                onClick={toggleOpen}
                className="gap-2 text-brand-silver hover:text-brand-white capitalize"
            >
                <Globe className="w-4 h-4" />
                <span className="hidden md:inline">{language === 'en' ? 'English' : 'العربية'}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: direction === 'down' ? 10 : -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: direction === 'down' ? 10 : -10 }}
                            className={cn(
                                "absolute right-0 w-32 bg-brand-surface-subtle border border-brand-white/10 rounded-sm overflow-hidden z-50 shadow-xl",
                                direction === 'down' ? "top-full mt-2" : "bottom-full mb-2"
                            )}
                        >
                            <button
                                onClick={() => { setLanguage('en'); setIsOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-brand-silver hover:text-brand-white hover:bg-brand-white/5 transition-colors"
                            >
                                English
                                {language === 'en' && <Check className="w-3 h-3 text-brand-red" />}
                            </button>
                            <button
                                onClick={() => { setLanguage('ar'); setIsOpen(false); }}
                                className="w-full flex items-center justify-between px-4 py-2 text-sm text-brand-silver hover:text-brand-white hover:bg-brand-white/5 transition-colors font-sans"
                            >
                                العربية
                                {language === 'ar' && <Check className="w-3 h-3 text-brand-red" />}
                            </button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
