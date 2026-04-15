import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

    let response = NextResponse.next({
        request: {
            headers: new Headers({
                ...Object.fromEntries(request.headers),
                'x-device-type': isMobile ? 'mobile' : 'desktop',
            }),
        },
    })

    // Refresh Supabase session on every request so cookies stay fresh
    // This fixes blank dashboard and stale auth state after page refresh
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
        const supabase = createServerClient(
            supabaseUrl,
            supabaseAnonKey,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options: CookieOptions) {
                        request.cookies.set({ name, value, ...options } as any)
                        // Make sure we carry over our custom injected headers!
                        response = NextResponse.next({
                            request: {
                                headers: new Headers({
                                    ...Object.fromEntries(request.headers),
                                    'x-device-type': isMobile ? 'mobile' : 'desktop'
                                }),
                            },
                        })
                        response.cookies.set({ name, value, ...options } as any)
                        response.headers.set('x-device-type', isMobile ? 'mobile' : 'desktop')
                    },
                    remove(name: string, options: CookieOptions) {
                        request.cookies.set({ name, value: '', ...options } as any)
                        response = NextResponse.next({
                            request: {
                                headers: new Headers({
                                    ...Object.fromEntries(request.headers),
                                    'x-device-type': isMobile ? 'mobile' : 'desktop'
                                }),
                            },
                        })
                        response.cookies.set({ name, value: '', ...options } as any)
                        response.headers.set('x-device-type', isMobile ? 'mobile' : 'desktop')
                    },
                },
            }
        )

        // This call refreshes the session and updates cookies automatically
        await supabase.auth.getUser()
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - icon.png (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)',
    ],
}
