import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function parseProductImages(image: any): string[] {
    if (!image) return []

    // If it's already an array, return it
    if (Array.isArray(image)) return image

    // If it's a string
    if (typeof image === 'string') {
        const cleaned = image.trim()

        // Try to parse as JSON array (e.g. '["url1", "url2"]')
        if (cleaned.startsWith('[')) {
            try {
                const parsed = JSON.parse(cleaned)
                if (Array.isArray(parsed)) return parsed
            } catch (e) {
                // Failed to parse, continue to treat as single string
            }
        }

        // Handle Postgres array syntax (e.g. '{url1,url2}') - simplified
        if (cleaned.startsWith('{') && cleaned.endsWith('}')) {
            // This is risky with URLs containing commas, but basic support:
            return cleaned.slice(1, -1).split(',').map(s => s.replace(/"/g, ''))
        }

        // Return as single image array
        return [cleaned]
    }

    return []
}
