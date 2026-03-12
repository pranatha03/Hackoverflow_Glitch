/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                space: {
                    950: '#0b0f1a', // Deep background
                    900: '#141b2d',
                    800: '#1f2942',
                },
                accent: {
                    cyan: '#00f0ff',
                    amber: '#ffbd00',
                    red: '#ff003c',
                }
            },
            fontFamily: {
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
                sans: ['Inter', 'system-ui', 'sans-serif']
            }
        },
    },
    plugins: [],
}
