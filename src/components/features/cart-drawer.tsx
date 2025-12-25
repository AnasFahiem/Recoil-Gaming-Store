"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { X, Minus, Plus } from "lucide-react"
import { useCart } from "@/contexts/cart-context"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/contexts/currency-context"
import { useLanguage } from "@/contexts/language-context"

export function CartDrawer() {
    const { isOpen, toggleCart, items, total, updateQuantity, removeFromCart } = useCart()
    const router = useRouter()
    const { formatPrice } = useCurrency()
    const { t } = useLanguage()

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-brand-black/80 backdrop-blur-sm z-50"
                        onClick={() => toggleCart(false)}
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-brand-surface border-l border-brand-white/10 z-50 flex flex-col shadow-2xl"
                    >
                        <div className="flex items-center justify-between p-6 border-b border-brand-white/10">
                            <Typography variant="h3" className="text-xl">{t.common.cart} ({items.length})</Typography>
                            <Button variant="ghost" size="icon" onClick={() => toggleCart(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <Typography variant="h4" className="text-brand-silver mb-4">{t.common.emptyCart}</Typography>
                                <Button variant="outline" onClick={() => toggleCart(false)}>{t.common.viewAll}</Button>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {items.map((item) => (
                                    <div key={item.id + item.size} className="flex gap-4">
                                        <div className="h-20 w-20 bg-brand-surface-subtle rounded-sm border border-brand-white/5 shrink-0 overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            {item.image && <img src={item.image} alt={item.name} className="h-full w-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-heading font-medium text-brand-white">{item.name}</h4>
                                                <span className="font-mono text-sm">{formatPrice(item.price * item.quantity)}</span>
                                            </div>
                                            <p className="text-xs text-brand-silver/50 mb-3">{t.common.size}: {item.size}</p>

                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center border border-brand-white/10 rounded-sm">
                                                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-brand-white/5"><Minus className="w-3 h-3 text-brand-silver" /></button>
                                                    <span className="px-2 text-xs font-mono">{item.quantity}</span>
                                                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-brand-white/5"><Plus className="w-3 h-3 text-brand-silver" /></button>
                                                </div>
                                                <button onClick={() => removeFromCart(item.id)} className="text-xs text-brand-silver underline hover:text-brand-red decoration-brand-silver/30">Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="p-6 border-t border-brand-white/10 bg-brand-surface-subtle/30">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-brand-silver uppercase text-sm tracking-wider">{t.common.subtotal}</span>
                                <span className="text-2xl font-mono font-medium text-brand-white">{formatPrice(total)}</span>
                            </div>
                            <p className="text-xs text-brand-silver/50 mb-6 text-center">Shipping & taxes calculated at checkout</p>
                            <Button
                                className="w-full"
                                size="lg"
                                variant="recoil-glitch"
                                disabled={items.length === 0}
                                onClick={() => {
                                    toggleCart(false)
                                    router.push('/checkout')
                                }}
                            >
                                {t.common.checkout}
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
