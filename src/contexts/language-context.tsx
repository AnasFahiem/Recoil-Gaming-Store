"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { dictionary, Locale } from '@/lib/i18n/dictionary'

type LanguageContextType = {
    language: Locale
    setLanguage: (lang: Locale) => void
    t: typeof dictionary['en']
    dir: 'ltr' | 'rtl'
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Locale>('en')

    // Initialize from localStorage or default
    useEffect(() => {
        const saved = localStorage.getItem('language') as Locale
        if (saved && (saved === 'en' || saved === 'ar')) {
            setLanguage(saved)
        }
    }, [])

    // Update Document Direction
    useEffect(() => {
        const dir = language === 'ar' ? 'rtl' : 'ltr'
        document.documentElement.dir = dir
        document.documentElement.lang = language
        localStorage.setItem('language', language)
    }, [language])

    const t = dictionary[language]
    const dir = language === 'ar' ? 'rtl' : 'ltr'

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
