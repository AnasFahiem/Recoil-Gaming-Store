import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            screens: {
                '3xl': '1920px',
                '2k': '2560px',
                '4k': '3840px',
            },
            colors: {
                brand: {
                    red: '#D72631',
                    black: '#0F1113',
                    silver: '#BFC6CC',
                    white: '#FFFFFF',
                },
                surface: {
                    DEFAULT: '#0F1113', // Void Black
                    subtle: '#1A1D21',
                    glass: 'rgba(15, 17, 19, 0.7)',
                }
            },
            fontFamily: {
                heading: ['var(--font-outfit)', 'var(--font-cairo)', 'sans-serif'],
                body: ['var(--font-inter)', 'var(--font-cairo)', 'sans-serif'],
                cairo: ['var(--font-cairo)', 'sans-serif'],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "recoil-gradient": "linear-gradient(90deg, #D72631 0%, #0F1113 100%)",
            },
            animation: {
                'recoil-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }
        },
    },
    plugins: [],
};
export default config;
