/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                'love-bg': '#FFCDD4',
                'love-primary': '#E30523',
                'every-bg': '#6AD59D',
                'every-primary': '#3D2181',
                'idol-bg': '#97D5FF',
            },
        },
    },
    plugins: [],
    // Important: Prevent conflicts with MUI
    corePlugins: {
        preflight: false,
    },
}
