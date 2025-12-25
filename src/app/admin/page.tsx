"use client"

import { Container } from "@/components/ui/container"
import { Button } from "@/components/ui/button"
import { Typography } from "@/components/ui/typography"
import Link from "next/link"
import { Package, ShoppingBag, Users, Plus, Edit, Trash2, Menu, X, Settings as SettingsIcon, User, MapPin, Lock, Upload, LogOut, BarChart3 } from "lucide-react"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import AdminProductEditor from "@/components/features/admin-product-editor"
import AdminBundleEditor from "@/components/features/admin-bundle-editor"
import { AnalyticsChart } from "@/components/features/analytics-chart"
import { SignOutButton } from "@/components/features/sign-out-button"
import { LoadingScreen } from "@/components/ui/loading-screen"
import { useLanguage } from "@/contexts/language-context"
import { useAdminAuth } from "@/hooks/use-admin-auth"
import { useWindowFocus } from "@/hooks/use-window-focus"

export const dynamic = 'force-dynamic'

export default function AdminDashboard() {
    const { t } = useLanguage()
    const router = useRouter()
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'bundles' | 'analytics' | 'settings'>('products')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    // Editor State
    const [editingProductId, setEditingProductId] = useState<string | null>(null)
    const [isEditing, setIsEditing] = useState(false)
    const [editingBundleId, setEditingBundleId] = useState<string | null>(null)
    const [isEditingBundle, setIsEditingBundle] = useState(false)

    // State for Real Data
    const [products, setProducts] = useState<any[]>([])
    const [bundles, setBundles] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [profiles, setProfiles] = useState<any[]>([]) // Role data

    // Analytics Data
    const [subscribers, setSubscribers] = useState<any[]>([])
    const [chartData, setChartData] = useState<any[]>([])
    const [stats, setStats] = useState({ visits: 0, unique: 0, subscribers: 0, revenue: 0, conversion: "0", aov: "0", users: 0 })

    // Settings State
    const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { isAuthenticated, isLoading: authLoading } = useAdminAuth()

    // Auto-refresh when tab comes back into focus
    useWindowFocus(() => {
        if (isAuthenticated) {
            console.log("Tab focused, refreshing data...")
            fetchData()
        }
    })

    // Initial Fetch when Auth is confirmed
    useEffect(() => {
        if (isAuthenticated) {
            fetchData()
        }
    }, [isAuthenticated, activeTab])

    if (authLoading) {
        return <LoadingScreen />
    }

    if (!isAuthenticated) {
        return null // Will redirect via hook
    }

    const fetchData = async () => {
        if (!supabase) return
        setLoading(true)
        try {
            if (activeTab === 'products') {
                const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
                if (data) setProducts(data)
            } else if (activeTab === 'orders') {
                const { data } = await supabase
                    .from('orders')
                    .select(`
                        id,
                        customer_email,
                        total,
                        status,
                        created_at,
                        order_items (
                            product_name,
                            quantity
                        )
                    `)
                    .order('created_at', { ascending: false })
                if (data) setOrders(data)
            } else if (activeTab === 'users') {
                // Fetch Auth Users (API) and Profiles (DB)
                try {
                    const [resUsers, { data: resProfiles }] = await Promise.all([
                        fetch('/api/admin/users').then(r => r.json()),
                        supabase.from('profiles').select('*')
                    ])

                    if (resUsers.users) setUsers(resUsers.users)
                    if (resProfiles) setProfiles(resProfiles)
                } catch (e) {
                    setError("Failed to sync user database.")
                }
            } else if (activeTab === 'analytics') {
                try {
                    // Parallel Fetching for Analytics with LIMITS to prevent timeouts
                    const [subsResponse, visitsResponse, ordersResponse, usersCountResponse] = await Promise.all([
                        supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false }).limit(50),
                        // Limit visits to last 2000 for chart performance
                        supabase.from('analytics_visits').select('created_at, visitor_id').order('created_at', { ascending: false }).limit(2000),
                        supabase.from('orders').select('total'),
                        supabase.from('profiles').select('id', { count: 'exact', head: true })
                    ])

                    const subs = subsResponse.data
                    const visits = visitsResponse.data
                    const orders = ordersResponse.data
                    const userCount = usersCountResponse.count

                    if (subs) setSubscribers(subs)

                    if (visits && orders) {
                        // Group by Date for Chart (Last 30 days likely captured in 2000 visits)
                        const grouped: Record<string, number> = {}
                        // Reverse to show oldest first in chart if we fetched desc
                        const sortedVisits = [...visits].reverse()

                        sortedVisits.forEach((v: any) => {
                            const date = new Date(v.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            grouped[date] = (grouped[date] || 0) + 1
                        })

                        // Convert to Array
                        const chart = Object.keys(grouped).map(key => ({ date: key, visits: grouped[key] }))
                        setChartData(chart)

                        // Financials
                        const totalRevenue = orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0)
                        const totalOrders = orders.length
                        const uniqueVisitors = new Set(visits.map((v: any) => v.visitor_id)).size
                        const conversionRate = uniqueVisitors > 0 ? ((totalOrders / uniqueVisitors) * 100).toFixed(2) : "0"
                        const aov = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : "0"

                        // KPIs
                        setStats({
                            visits: visits.length, // Displaying sample size if capped
                            unique: uniqueVisitors,
                            subscribers: subs?.length || 0,
                            revenue: totalRevenue,
                            conversion: conversionRate,
                            aov: aov,
                            users: userCount || 0
                        })
                    }
                } catch (err) {
                    console.error("Analytics fetch error:", err)
                    setError("Failed to load analytics data.")
                }
            } else if (activeTab === 'bundles') {
                const { data } = await supabase.from('bundles').select('*').order('created_at', { ascending: false })
                if (data) setBundles(data)
            }
        } catch (error) {
            console.error("Critical dashboard fetch error:", error)
            setError("A critical error occurred while loading data.")
        } finally {
            setLoading(false)
        }
    }

    const handlePromote = async (userId: string, currentRole: string) => {
        if (!supabase) return

        const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN'

        try {
            const { data, error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId)
                .select()

            if (error) {
                console.error("Role update error:", error)
                alert(`Failed to update role: ${error.message}`)
                return
            }

            if (!data || data.length === 0) {
                alert("No profile found for this user. Please refresh and try again.")
                return
            }

            console.log("Role updated successfully:", data)

            // Force re-fetch profiles
            await fetchData()

        } catch (err: any) {
            console.error("Unexpected error:", err)
            alert("An error occurred. Please try again.")
        }
    }

    const handleDeleteProduct = async (id: string) => {
        if (!supabase) return
        if (!confirm(t.admin.actions.confirmDelete)) return
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (!error) fetchData()
    }

    const handleDeleteBundle = async (id: string) => {
        if (!supabase) return
        if (!confirm(t.admin.actions.confirmDelete)) return
        const { error } = await supabase.from('bundles').delete().eq('id', id)
        if (!error) fetchData()
    }

    const handleDeleteUser = async (id: string) => {
        if (!confirm(t.admin.actions.confirmDeleteUser)) return

        try {
            const res = await fetch('/api/admin/delete-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: id })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || "Failed to delete user")
            } else {
                fetchData() // Refresh list
            }
        } catch (err) {
            alert("Network error deleting user")
        }
    }

    const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
        if (!supabase) return
        const { error } = await supabase
            .from('orders')
            .update({ status: newStatus })
            .eq('id', orderId)
        if (!error) {
            // Send customer notification email
            try {
                await fetch('/api/orders/notify-customer', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ orderId, newStatus })
                })
            } catch (err) {
                console.error('Failed to send customer notification:', err)
            }
            fetchData() // Refresh orders
        } else {
            alert("Failed to update order status")
        }
    }



    const handleApproveCancel = async (orderId: string) => {
        if (!confirm(t.admin.actions.confirmApproveCancel)) return

        try {
            // Get session token for Admin Auth
            const { data: { session } } = await supabase!.auth.getSession()
            const token = session?.access_token

            if (!token) {
                alert("Session lost. Please sign in again.")
                return
            }

            const res = await fetch('/api/admin/orders/approve-cancel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ orderId })
            })

            const data = await res.json()

            if (res.ok) {
                alert("Order cancelled and user notified.")
                fetchData()
            } else {
                alert(data.error || "Failed to approve cancellation")
            }
        } catch (err) {
            alert("Network error processing cancellation")
        }
    }

    // Combine User + Profile
    const getUserRole = (id: string) => profiles.find(p => p.id === id)?.role || 'USER'
    const getUserPhone = (id: string) => profiles.find(p => p.id === id)?.phone || '-'

    // Editor Handlers
    const startEdit = (id: string | null) => {
        setEditingProductId(id)
        setIsEditing(true)
    }

    const cancelEdit = () => {
        setIsEditing(false)
        setEditingProductId(null)
    }

    const completeEdit = () => {
        setIsEditing(false)
        setEditingProductId(null)
        fetchData() // Refresh list
    }

    if (isEditing) {
        return (
            <div className="min-h-screen bg-brand-black p-8">
                <Container>
                    <AdminProductEditor
                        productId={editingProductId}
                        onCancel={cancelEdit}
                        onSave={completeEdit}
                    />
                </Container>
            </div>
        )
    }

    if (isEditingBundle) {
        return (
            <div className="min-h-screen bg-brand-black p-8">
                <Container>
                    <AdminBundleEditor
                        bundleId={editingBundleId}
                        onCancel={() => { setIsEditingBundle(false); setEditingBundleId(null); }}
                        onSave={() => { setIsEditingBundle(false); setEditingBundleId(null); fetchData(); }}
                    />
                </Container>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-brand-black">
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 bg-brand-surface-subtle border-b border-brand-white/10 p-4 z-30 flex items-center justify-between">
                <div>
                    <Typography variant="h3" className="text-brand-red text-lg">RECOIL</Typography>
                    <p className="text-brand-silver text-xs">{t.admin.dashboard}</p>
                </div>
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-brand-white">
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar - Desktop & Mobile */}
            <div className={`fixed left-0 top-0 h-full w-64 bg-brand-surface-subtle border-r border-brand-white/10 p-6 z-20 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                <div className="mb-8 mt-16 lg:mt-0">
                    <Typography variant="h3" className="text-brand-red">RECOIL</Typography>
                    <p className="text-brand-silver text-sm">{t.admin.dashboard}</p>
                </div>

                <nav className="space-y-2">
                    <button onClick={() => { setActiveTab('products'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'products' ? 'bg-brand-red text-white' : 'text-brand-silver hover:bg-brand-white/5'}`}>
                        <Package className="w-5 h-5" /> {t.admin.products}
                    </button>
                    <button onClick={() => { setActiveTab('orders'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'orders' ? 'bg-brand-red text-white' : 'text-brand-silver hover:bg-brand-white/5'}`}>
                        <ShoppingBag className="w-5 h-5" /> {t.admin.orders}
                    </button>
                    <button onClick={() => { setActiveTab('bundles'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'bundles' ? 'bg-brand-red text-white' : 'text-brand-silver hover:bg-brand-white/5'}`}>
                        <Package className="w-5 h-5" /> {t.admin.bundleMaker}
                    </button>
                    <button onClick={() => { setActiveTab('users'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'users' ? 'bg-brand-red text-white' : 'text-brand-silver hover:bg-brand-white/5'}`}>
                        <Users className="w-5 h-5" /> {t.admin.users}
                    </button>
                    <button onClick={() => { setActiveTab('analytics'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'analytics' ? 'bg-brand-red text-white' : 'text-brand-silver hover:bg-brand-white/5'}`}>
                        <BarChart3 className="w-5 h-5" /> {t.admin.analytics}
                    </button>
                    <button onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-colors ${activeTab === 'settings' ? 'bg-brand-red text-white' : 'text-brand-silver hover:bg-brand-white/5'}`}>
                        <SettingsIcon className="w-5 h-5" /> {t.admin.settingsNav}
                    </button>
                </nav>

                <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <Link href="/"><Button variant="outline" className="w-full">{t.admin.backToSite}</Button></Link>
                    <SignOutButton className="w-full justify-start text-brand-silver hover:text-brand-red hover:bg-brand-white/5" variant="ghost">
                        <LogOut className="w-4 h-4 mr-2" /> {t.nav.signOut}
                    </SignOutButton>
                </div>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-brand-black/80 z-10"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="lg:ml-64 p-4 md:p-8 pt-20 lg:pt-8">
                <Container>
                    {/* Products Tab */}
                    {activeTab === 'products' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <Typography variant="h2" className="text-brand-white">{t.admin.products}</Typography>
                                <Button className="gap-2" onClick={() => startEdit('new')}>
                                    <Plus className="w-4 h-4" /> {t.admin.addProduct}
                                </Button>
                            </div>

                            {loading && <LoadingScreen variant="inline" text="Loading Products..." />}

                            {!loading && (
                                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-brand-black/50 border-b border-brand-white/10">
                                            <tr>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.product}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.category}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.price}</th>
                                                <th className="text-right p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.common.actions}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-brand-silver">{t.admin.empty.products}</td></tr>}
                                            {products.map((product) => (
                                                <tr key={product.id} className="border-b border-brand-white/5 hover:bg-brand-white/5 transition-colors">
                                                    <td className="p-4 text-brand-white font-medium">{product.name}</td>
                                                    <td className="p-4 text-brand-silver">{product.category}</td>
                                                    <td className="p-4 text-brand-white">EGP {Number(product.price * 50).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 text-brand-silver hover:text-brand-white transition-colors" onClick={() => startEdit(product.id)}>
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-2 text-brand-silver hover:text-brand-red transition-colors" onClick={() => handleDeleteProduct(product.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Orders Tab */}
                    {activeTab === 'orders' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <Typography variant="h2" className="text-brand-white">{t.admin.orders}</Typography>
                                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                                    {loading ? <span className="animate-spin mr-2">⟳</span> : null}
                                    {t.common.refresh}
                                </Button>
                            </div>

                            {loading && <LoadingScreen variant="inline" text="Loading Orders..." />}

                            {!loading && (
                                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-brand-black/50 border-b border-brand-white/10">
                                            <tr>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.orderId}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.customer}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.items}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.common.total}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.status}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.date}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orders.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-brand-silver">{t.admin.empty.orders}</td></tr>}
                                            {orders.map((order) => (
                                                <tr key={order.id} className="border-b border-brand-white/5 hover:bg-brand-white/5 transition-colors">
                                                    <td className="p-4 text-brand-white font-mono text-xs">#{order.id.slice(0, 8)}</td>
                                                    <td className="p-4 text-brand-silver text-sm">{order.customer_email}</td>
                                                    <td className="p-4 text-brand-silver text-sm">
                                                        {order.order_items.map((item: any, idx: number) => (
                                                            <div key={idx} className="text-xs">
                                                                {item.quantity}x {item.product_name}
                                                            </div>
                                                        ))}
                                                    </td>
                                                    <td className="p-4 text-brand-white font-bold">EGP {Number(order.total).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <select
                                                            value={order.status}
                                                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                                            className={`bg-brand-black border border-brand-white/10 text-brand-white px-3 py-1 rounded-sm text-xs focus:outline-none focus:border-brand-red ${order.status === 'cancellation_requested' ? 'border-yellow-500 text-yellow-500 font-bold' : ''
                                                                }`}
                                                        >
                                                            {order.status === 'cancellation_requested' && (
                                                                <option value="cancellation_requested">{t.admin.status.cancellation_requested}</option>
                                                            )}
                                                            <option value="Processing">{t.admin.status.processing}</option>
                                                            <option value="Shipped">{t.admin.status.shipped}</option>
                                                            <option value="Delivered">{t.admin.status.delivered}</option>
                                                            <option value="Cancelled">{t.admin.status.cancelled}</option>
                                                        </select>

                                                        {order.status === 'cancellation_requested' && (
                                                            <div className="mt-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleApproveCancel(order.id)}
                                                                    className="bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white text-[10px] uppercase h-6 px-2 w-full"
                                                                >
                                                                    {t.admin.status.approve_cancel}
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-4 text-brand-silver text-sm">
                                                        {new Date(order.created_at).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Bundles Tab */}
                    {activeTab === 'bundles' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <Typography variant="h2" className="text-brand-white">{t.admin.bundleMaker}</Typography>
                                <Button className="gap-2" onClick={() => { setEditingBundleId('new'); setIsEditingBundle(true); }}>
                                    <Plus className="w-4 h-4" /> {t.admin.createBundle}
                                </Button>
                            </div>

                            {loading && <LoadingScreen variant="inline" text="Loading Bundles..." />}

                            {!loading && (
                                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-brand-black/50 border-b border-brand-white/10">
                                            <tr>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.bundleName}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.price}</th>
                                                <th className="text-right p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.common.actions}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bundles.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-brand-silver">{t.admin.empty.bundles}</td></tr>}
                                            {bundles.map((bundle) => (
                                                <tr key={bundle.id} className="border-b border-brand-white/5 hover:bg-brand-white/5 transition-colors">
                                                    <td className="p-4 text-brand-white font-medium">{bundle.name}</td>
                                                    <td className="p-4 text-brand-white">EGP {Number(bundle.price * 50).toLocaleString()}</td>
                                                    <td className="p-4">
                                                        <div className="flex justify-end gap-2">
                                                            <button className="p-2 text-brand-silver hover:text-brand-white transition-colors" onClick={() => { setEditingBundleId(bundle.id); setIsEditingBundle(true); }}>
                                                                <Edit className="w-4 h-4" />
                                                            </button>
                                                            <button className="p-2 text-brand-silver hover:text-brand-red transition-colors" onClick={() => handleDeleteBundle(bundle.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="space-y-8">
                            <div>
                                <Typography variant="h2" className="text-brand-white mb-2">{t.admin.missionAnalytics}</Typography>
                                <p className="text-brand-silver">{t.admin.realTimeIntel}</p>
                            </div>

                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Row 1: Traffic */}
                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.totalVisits}</p>
                                            <h3 className="text-3xl font-bold text-brand-white mt-1">{stats.visits}</h3>
                                        </div>
                                        <div className="p-2 bg-brand-white/5 rounded-full">
                                            <BarChart3 className="w-5 h-5 text-brand-red" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">All time page loads</p>
                                </div>

                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.uniqueVisitors}</p>
                                            <h3 className="text-3xl font-bold text-brand-white mt-1">{stats.unique}</h3>
                                        </div>
                                        <div className="p-2 bg-brand-white/5 rounded-full">
                                            <Users className="w-5 h-5 text-brand-red" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">Distinct visitors tracked</p>
                                </div>

                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.registeredOperatives}</p>
                                            <h3 className="text-3xl font-bold text-brand-white mt-1">{stats.users}</h3>
                                        </div>
                                        <div className="p-2 bg-brand-white/5 rounded-full">
                                            <User className="w-5 h-5 text-brand-red" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">Total signed up users</p>
                                </div>

                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.squadronRecruits}</p>
                                            <h3 className="text-3xl font-bold text-brand-white mt-1">{stats.subscribers}</h3>
                                        </div>
                                        <div className="p-2 bg-brand-white/5 rounded-full">
                                            <ShoppingBag className="w-5 h-5 text-brand-red" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">Newsletter signups</p>
                                </div>

                                {/* Row 2: Financials */}
                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.totalRevenue}</p>
                                            <h3 className="text-3xl font-bold text-green-500 mt-1">EGP {(stats.revenue * 50).toLocaleString()}</h3>
                                        </div>
                                        <div className="p-2 bg-green-500/10 rounded-full">
                                            <span className="text-green-500 font-bold text-xs">EGP</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">Gross Sales</p>
                                </div>

                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.conversionRate}</p>
                                            <h3 className="text-3xl font-bold text-brand-white mt-1">{stats.conversion}%</h3>
                                        </div>
                                        <div className="p-2 bg-brand-white/5 rounded-full">
                                            <BarChart3 className="w-5 h-5 text-brand-red" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">Orders / Unique Visitors</p>
                                </div>

                                <div className="p-6 rounded-sm bg-brand-surface-subtle border border-brand-white/10">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="text-brand-silver text-xs uppercase tracking-wider font-semibold">{t.admin.analyticsLabels.avgOrderValue}</p>
                                            <h3 className="text-3xl font-bold text-brand-white mt-1">EGP {(Number(stats.aov) * 50).toLocaleString()}</h3>
                                        </div>
                                        <div className="p-2 bg-brand-white/5 rounded-full">
                                            <ShoppingBag className="w-5 h-5 text-brand-red" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-brand-silver/50">Revenue / Total Orders</p>
                                </div>
                            </div>

                            {/* Chart Section */}
                            <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-6">
                                <h4 className="text-brand-white font-medium mb-6">{t.admin.analyticsLabels.trafficIntel}</h4>
                                <div className="h-[300px] w-full">
                                    {chartData.length > 0 ? (
                                        <AnalyticsChart data={chartData} />
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-brand-silver/30 border-2 border-dashed border-brand-white/5 rounded-sm">
                                            {t.admin.empty.traffic}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Subscribers Feed */}
                            <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm overflow-hidden">
                                <div className="p-6 border-b border-brand-white/10">
                                    <h4 className="text-brand-white font-medium">{t.admin.analyticsLabels.recentRecruits}</h4>
                                </div>
                                <table className="w-full">
                                    <thead className="bg-brand-black/50 border-b border-brand-white/10">
                                        <tr>
                                            <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.email}</th>
                                            <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.joined}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.length === 0 && (
                                            <tr><td colSpan={2} className="p-8 text-center text-brand-silver">{t.admin.empty.recruits}</td></tr>
                                        )}
                                        {subscribers.map((sub: any) => (
                                            <tr key={sub.id} className="border-b border-brand-white/5 hover:bg-brand-white/5">
                                                <td className="p-4 text-brand-white">{sub.email}</td>
                                                <td className="p-4 text-brand-silver text-sm">
                                                    {new Date(sub.created_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users Tab */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <Typography variant="h3" className="text-brand-white">{t.admin.users}</Typography>
                                <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                                    {loading ? <span className="animate-spin mr-2">⟳</span> : null}
                                    {t.common.refresh}
                                </Button>
                            </div>

                            {error && (
                                <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-sm">
                                    {error}
                                </div>
                            )}

                            {loading && <LoadingScreen variant="inline" text="Syncing Users..." />}

                            {!loading && (
                                <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-brand-black/50 border-b border-brand-white/10">
                                            <tr>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.email}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.phone}</th>
                                                <th className="text-left p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.admin.table.role}</th>
                                                <th className="text-center p-4 text-brand-silver text-sm font-medium uppercase tracking-wider">{t.common.actions}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map((user) => {
                                                const role = getUserRole(user.id)
                                                const phone = getUserPhone(user.id)
                                                return (
                                                    <tr key={user.id} className="border-b border-brand-white/5 hover:bg-brand-white/5 transition-colors">
                                                        <td className="p-4 text-brand-white">{user.email}</td>
                                                        <td className="p-4 text-brand-silver">{phone}</td>
                                                        <td className="p-4 text-brand-silver font-mono text-xs">
                                                            <span className={`px-2 py-1 rounded-sm ${role === 'ADMIN' ? 'bg-brand-red text-white' : 'bg-brand-white/10 text-brand-silver'}`}>
                                                                {role}
                                                            </span>
                                                        </td>
                                                        <td className="p-4 text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <Button size="sm" variant="ghost" className="text-xs hover:text-brand-white" onClick={() => handlePromote(user.id, role)}>
                                                                    {role === 'ADMIN' ? t.admin.actions.demote : t.admin.actions.makeAdmin}
                                                                </Button>
                                                                <button
                                                                    onClick={() => handleDeleteUser(user.id)}
                                                                    className="p-2 text-brand-silver hover:text-brand-red transition-colors"
                                                                    title={t.admin.actions.deleteUser}
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div>
                            <Typography variant="h2" className="text-brand-white mb-8">{t.admin.settingsNav}</Typography>

                            {/* Settings Message */}
                            {settingsMessage && (
                                <div className={`p-4 rounded-sm mb-6 ${settingsMessage.type === 'success'
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                    }`}>
                                    {settingsMessage.text}
                                </div>
                            )}

                            {/* Security Tab Content */}
                            <div className="bg-brand-surface-subtle border border-brand-white/10 rounded-sm p-8">
                                <div className="space-y-6">
                                    {/* Removed deprecated Change Password section */}
                                    <div className="pt-6 border-t border-brand-white/10">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-sm text-brand-silver">
                                                {t.admin.settings.manageProfileDesc}
                                            </p>
                                            <Link href="/user?view=settings">
                                                <Button variant="recoil-glitch" className="w-full sm:w-auto">
                                                    {t.admin.settings.manageProfile}
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </Container>
            </div>
        </div>
    )
}
