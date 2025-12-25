
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || ''

    // Simple check for mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-device-type', isMobile ? 'mobile' : 'desktop')

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    })
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
