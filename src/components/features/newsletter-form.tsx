"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useLanguage } from "@/contexts/language-context"

export function NewsletterForm() {
    const { t } = useLanguage()
    const [email, setEmail] = useState("")
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [message, setMessage] = useState("")

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                setStatus('success')
                setMessage(t.newsletter.success)
                setEmail("")
            } else {
                setStatus('error')
                setMessage(data.error || t.newsletter.error)
            }
        } catch (error) {
            setStatus('error')
            setMessage(t.newsletter.error)
        }

        setTimeout(() => setStatus('idle'), 5000)
    }

    return (
        <form onSubmit={handleSubmit} className="w-full">
            <div className="flex flex-col sm:flex-row w-full max-w-sm items-center gap-3 sm:gap-2 mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t.newsletter.placeholder}
                    required
                    disabled={status === 'loading'}
                    className="w-full sm:flex-1 bg-brand-black/50 border border-brand-white/20 rounded-sm px-4 py-3 text-brand-white focus:outline-none focus:border-brand-red transition-colors disabled:opacity-50"
                />
                <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full sm:w-auto"
                >
                    {status === 'loading' ? t.newsletter.subscribing : t.newsletter.button}
                </Button>
            </div>
            {message && (
                <p className={`text-sm mt-3 text-center ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                    {message}
                </p>
            )}
        </form>
    )
}
