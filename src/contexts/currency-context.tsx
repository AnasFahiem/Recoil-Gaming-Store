"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useLanguage } from "@/contexts/language-context"

export type Currency = "USD" | "EUR" | "EGP"

interface CurrencyContextType {
    currency: Currency
    setCurrency: (currency: Currency) => void
    formatPrice: (priceInUsd: number) => string
    convertPrice: (priceInUsd: number) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const RATES = {
    USD: 1,
    EUR: 0.95,
    EGP: 50, // Approximation
}

const SYMBOLS = {
    USD: "$",
    EUR: "€",
    EGP: "EGP ",
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>("EGP")
    const { t, language } = useLanguage()

    // Persist to local storage
    useEffect(() => {
        const saved = localStorage.getItem("currency") as Currency
        if (saved && RATES[saved]) {
            setCurrency(saved)
        }
    }, [])

    const handleSetCurrency = (c: Currency) => {
        setCurrency(c)
        localStorage.setItem("currency", c)
    }

    const convertPrice = (priceInUsd: number) => {
        const rate = RATES[currency]
        return priceInUsd * rate
    }

    const formatPrice = (priceInUsd: number) => {
        const rate = RATES[currency]
        let symbol = SYMBOLS[currency]
        const value = priceInUsd * rate

        // Localize EGP symbol for Arabic
        if (currency === "EGP" && language === "ar") {
            symbol = "جنيه "
        }

        // Format differently based on currency if needed
        if (currency === "EGP") {
            return `${symbol}${value.toLocaleString('en-US')}`
        }
        return `${symbol}${value.toFixed(2)}`
    }

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, formatPrice, convertPrice }}>
            {children}
        </CurrencyContext.Provider>
    )
}

export function useCurrency() {
    const context = useContext(CurrencyContext)
    if (context === undefined) {
        throw new Error("useCurrency must be used within a CurrencyProvider")
    }
    return context
}
