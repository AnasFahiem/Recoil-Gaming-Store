"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"

export default function DebugCartPage() {
    const [status, setStatus] = useState<any>({})
    const [cartData, setCartData] = useState<any>(null)
    const [logs, setLogs] = useState<string[]>([])

    const addLog = (msg: string) => setLogs(prev => [...prev, `${new Date().toISOString().split('T')[1]} - ${msg}`])

    const checkSession = async () => {
        const { data } = await supabase.auth.getSession()
        setStatus(data.session)
        addLog(`Session checked: ${data.session?.user?.id || 'No user'}`)
    }

    const fetchCart = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return addLog("No session, cannot fetch")

        addLog("Fetching cart...")
        const { data, error } = await supabase
            .from('carts')
            .select('*')
            .eq('user_id', session.user.id)

        if (error) {
            addLog(`Error fetching: ${error.message} (${error.code})`)
        } else {
            setCartData(data)
            addLog(`Fetched ${data?.length} rows`)
        }
    }

    const saveTestItem = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return addLog("No session, cannot save")

        const testItem = [{ id: "test-1", name: "Test Item", quantity: 1, price: 100 }]
        addLog("Saving test item...")

        const { error } = await supabase
            .from('carts')
            .upsert({ user_id: session.user.id, items: testItem }, { onConflict: 'user_id' })

        if (error) {
            addLog(`Error saving: ${error.message} (${error.code})`)
        } else {
            addLog("Save successful")
            fetchCart()
        }
    }

    const clearLocal = () => {
        localStorage.removeItem("cart")
        addLog("Local storage cleared")
    }

    const manualSignOut = async () => {
        addLog("Signing out...")
        await supabase.auth.signOut()
        setStatus(null)
        setCartData(null)
        addLog("Signed out")
    }

    useEffect(() => {
        checkSession()
    }, [])

    const buttonStyle = {
        padding: '10px 20px',
        backgroundColor: '#0070f3',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        margin: '5px'
    }

    return (
        <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px', color: 'black' }}>Cart Debugger v2</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '10px', color: 'black' }}>Actions</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <button style={buttonStyle} onClick={checkSession}>1. Check Session</button>
                        <button style={buttonStyle} onClick={fetchCart}>2. Fetch Cart (DB)</button>
                        <button style={{ ...buttonStyle, backgroundColor: '#10b981' }} onClick={saveTestItem}>3. Save Test Item (DB)</button>
                        <button style={{ ...buttonStyle, backgroundColor: '#f59e0b' }} onClick={clearLocal}>Clear Local Cart</button>
                        <button style={{ ...buttonStyle, backgroundColor: '#ef4444' }} onClick={manualSignOut}>Sign Out</button>
                    </div>
                </div>

                <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
                    <h2 style={{ fontSize: '18px', marginBottom: '10px', color: 'black' }}>User State</h2>
                    <pre style={{ fontSize: '12px', background: '#f1f5f9', padding: '10px', borderRadius: '4px', overflow: 'auto', height: '200px', color: 'black' }}>
                        {JSON.stringify(status, null, 2)}
                    </pre>
                </div>
            </div>

            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px', color: 'black' }}>Database Cart Data</h2>
                <pre style={{ fontSize: '12px', background: '#0f172a', color: '#4ade80', padding: '15px', borderRadius: '4px', overflow: 'auto' }}>
                    {JSON.stringify(cartData, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '20px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: 'white' }}>
                <h2 style={{ fontSize: '18px', marginBottom: '10px', color: 'black' }}>Logs</h2>
                <div style={{ height: '200px', overflow: 'auto', background: '#f1f5f9', padding: '10px', borderRadius: '4px', fontSize: '12px', fontFamily: 'monospace', color: 'black', display: 'flex', flexDirection: 'column-reverse' }}>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>
            </div>
        </div>
    )
}
