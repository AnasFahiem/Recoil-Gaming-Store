"use client"

import { Container } from "@/components/ui/container"
import { Typography } from "@/components/ui/typography"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Loader2, Database, CheckCircle, AlertCircle } from "lucide-react"

export default function MigratePage() {
    const [migrating, setMigrating] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)

    const runMigration = async () => {
        setMigrating(true)
        setResult(null)
        setError(null)

        try {
            // Run Image Migration
            const imgRes = await fetch('/api/admin/migrate-images', { method: 'POST' })
            const imgData = await imgRes.json()

            // Run Category Migration
            const catRes = await fetch('/api/admin/migrate-categories', { method: 'POST' })
            const catData = await catRes.json()

            if (imgRes.ok && catRes.ok) {
                setResult({
                    ...imgData,
                    categoryMessage: catData.message
                })
            } else {
                setError((imgData.error || '') + ' ' + (catData.error || ''))
            }
        } catch (err: any) {
            setError(err.message || 'Network error')
        } finally {
            setMigrating(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-black pt-24 pb-24">
            <Container>
                <div className="max-w-2xl mx-auto">
                    <Typography variant="h1" className="mb-8 text-center">
                        Database <span className="text-brand-red">Migration</span>
                    </Typography>

                    <div className="bg-brand-surface-subtle border border-brand-white/10 p-8 rounded-sm">
                        <div className="flex items-center gap-4 mb-6">
                            <Database className="w-12 h-12 text-brand-red" />
                            <div>
                                <h2 className="text-xl font-heading text-brand-white mb-2">Image & Category Database Migration</h2>
                                <p className="text-brand-silver text-sm">
                                    Updates images to array format and consolidates Flag/Figure/Decor into &apos;Accessory&apos;.
                                </p>
                            </div>
                        </div>

                        <div className="bg-brand-black/50 p-4 rounded mb-6">
                            <p className="text-brand-silver text-sm mb-2">What this does:</p>
                            <ul className="text-brand-silver/70 text-xs space-y-1 list-disc list-inside">
                                <li>Converts single images to arrays</li>
                                <li>Renames old categories to &apos;Accessory&apos;</li>
                                <li>Preserves all product data</li>
                                <li>Safe to run multiple times</li>
                            </ul>
                        </div>

                        <Button
                            onClick={runMigration}
                            disabled={migrating}
                            className="w-full gap-2"
                            size="lg"
                        >
                            {migrating ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Running Migration...
                                </>
                            ) : (
                                <>
                                    <Database className="w-5 h-5" />
                                    Run Migration
                                </>
                            )}
                        </Button>

                        {result && (
                            <div className="mt-6 bg-green-500/10 border border-green-500/20 p-4 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="w-5 h-5 text-green-500" />
                                    <p className="text-green-500 font-medium">Migration Successful!</p>
                                </div>
                                <p className="text-brand-silver text-sm">
                                    Image Migration Info:
                                    <br />
                                    Migrated: {result.migrated} / Skipped: {result.skipped}
                                    <br /><br />
                                    {result.categoryMessage}
                                </p>
                            </div>
                        )}

                        {error && (
                            <div className="mt-6 bg-red-500/10 border border-red-500/20 p-4 rounded">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                    <p className="text-red-500 font-medium">Migration Failed</p>
                                </div>
                                <p className="text-brand-silver text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </div>
    )
}
