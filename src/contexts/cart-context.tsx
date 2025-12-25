"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export type CartItem = {
    id: string
    name: string
    price: number
    image: string
    category: string
    size: string
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    isOpen: boolean
    addToCart: (item: Omit<CartItem, "quantity">) => Promise<void>
    removeFromCart: (id: string, size?: string) => Promise<void>
    updateQuantity: (id: string, size: string, delta: number) => Promise<void>
    toggleCart: (open?: boolean) => void
    clearCart: () => Promise<void>
    total: number
    isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [user, setUser] = useState<any>(null)

    // 1. Initial Load & Auth Listener
    useEffect(() => {
        const init = async () => {
            setIsLoading(true)
            const { data: { session } } = await supabase.auth.getSession()

            if (session?.user) {
                setUser(session.user)
                await loadUserCart(session.user.id)
            } else {
                setUser(null)
                loadGuestCart()
            }
            setIsLoading(false)
        }
        init()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user)
                await mergeGuestCartToUser(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                setUser(null)
                setItems([]) // Clear user items from memory
                // Optional: Load guest cart if we want to allow immediate guest usage, 
                // typically empty after sign out unless we want to persist something else.
                // For now, start fresh guest cart.
                localStorage.removeItem("cart")
            }
        })

        return () => subscription.unsubscribe()
    }, [])

    // --- Helpers ---

    const loadGuestCart = () => {
        try {
            const local = localStorage.getItem("cart")
            if (local) setItems(JSON.parse(local))
            else setItems([])
        } catch (e) {
            console.error("Failed to load guest cart", e)
            setItems([])
        }
    }

    const loadUserCart = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('carts')
                .select('items')
                .eq('user_id', userId)
                .maybeSingle()

            if (error) throw error

            if (data?.items && Array.isArray(data.items)) {
                setItems(data.items)
            } else {
                setItems([])
            }
        } catch (e) {
            console.error("Failed to load user cart", e)
            // Fallback: stay empty or retry? for now, empty to avoid overwriting with bad data
        }
    }

    const saveUserCart = async (userId: string, newItems: CartItem[]) => {
        // Optimistic update
        setItems(newItems)

        try {
            const { error } = await supabase
                .from('carts')
                .upsert({ user_id: userId, items: newItems }, { onConflict: 'user_id' })

            if (error) throw error
        } catch (e) {
            console.error("Failed to save user cart", e)
            // Revert? For now, we just log. In a pro app we might show a toast.
        }
    }

    const saveGuestCart = (newItems: CartItem[]) => {
        setItems(newItems)
        localStorage.setItem("cart", JSON.stringify(newItems))
    }

    // Critical: Merge Guest -> User on Login
    const mergeGuestCartToUser = async (userId: string) => {
        // 1. Get Guest Items
        let guestItems: CartItem[] = []
        try {
            const local = localStorage.getItem("cart")
            if (local) guestItems = JSON.parse(local)
        } catch (e) { }

        if (guestItems.length === 0) {
            // Just load user cart
            await loadUserCart(userId)
            return
        }

        // 2. Get User Items
        let userItems: CartItem[] = []
        try {
            const { data } = await supabase.from('carts').select('items').eq('user_id', userId).maybeSingle()
            if (data?.items) userItems = data.items
        } catch (e) { }

        // 3. Merge Strategy: Add guest items to user cart. 
        // If same ID+Size exists, sum quantities.
        const merged = [...userItems]
        guestItems.forEach(gItem => {
            const existingIdx = merged.findIndex(u => u.id === gItem.id && u.size === gItem.size)
            if (existingIdx >= 0) {
                merged[existingIdx].quantity += gItem.quantity
            } else {
                merged.push(gItem)
            }
        })

        // 4. Save Merged & Clear Local
        await saveUserCart(userId, merged)
        localStorage.removeItem("cart")
    }

    // --- Actions ---

    const addToCart = async (newItem: Omit<CartItem, "quantity">) => {
        const currentItems = [...items]
        const existingIdx = currentItems.findIndex(i => i.id === newItem.id && i.size === newItem.size)

        let nextItems
        if (existingIdx >= 0) {
            currentItems[existingIdx].quantity += 1
            nextItems = currentItems
        } else {
            nextItems = [...currentItems, { ...newItem, quantity: 1 }]
        }

        if (user) await saveUserCart(user.id, nextItems)
        else saveGuestCart(nextItems)

        setIsOpen(true)
    }

    const removeFromCart = async (id: string, size?: string) => {
        // Filter by ID, and if size is provided, also by size
        const nextItems = items.filter(i => {
            if (size) return !(i.id === id && i.size === size)
            return i.id !== id
        })

        if (user) await saveUserCart(user.id, nextItems)
        else saveGuestCart(nextItems)
    }

    const updateQuantity = async (id: string, size: string, delta: number) => {
        const nextItems = items.map(i => {
            if (i.id === id && i.size === size) {
                return { ...i, quantity: Math.max(1, i.quantity + delta) }
            }
            return i
        })

        if (user) await saveUserCart(user.id, nextItems)
        else saveGuestCart(nextItems)
    }

    const clearCart = async () => {
        if (user) await saveUserCart(user.id, [])
        else saveGuestCart([])
    }

    const toggleCart = (open?: boolean) => {
        setIsOpen(open !== undefined ? open : !isOpen)
    }

    const total = items.reduce((acc, item) => acc + (item.price * item.quantity), 0)

    return (
        <CartContext.Provider value={{
            items, isOpen, isLoading,
            addToCart, removeFromCart, updateQuantity, toggleCart, clearCart,
            total
        }}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)
    if (!context) throw new Error("useCart must be used within CartProvider")
    return context
}
