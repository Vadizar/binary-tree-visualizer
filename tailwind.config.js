/** @type {import('tailwindcss').Config} */
export default {
    mode: 'jit',
    darkMode: 'class',
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './components/**/*.{vue,js,ts,jsx,tsx}',
        './**/*.vue',
    ],
    theme: {
        extend: {
            width: {
                '15': '3.75rem',
                '80': '20rem',
            },
            height: {
                '15': '3.75rem',
            },
            gap: {
                '15': '3.75rem',
            },
            maxWidth: {
                '12': '3rem',
                '20': '5rem',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(-20px) scale(0.8)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
                },
            },
        },
    },
    plugins: [],
}
