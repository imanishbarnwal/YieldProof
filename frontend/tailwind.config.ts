import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            fontFamily: {
                sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
                display: ["var(--font-syne)", "system-ui", "sans-serif"],
                body: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            fontWeight: {
                'ultra-thin': '100',
                'thin': '200',
                'light': '300',
                'normal': '400',
                'medium': '500',
                'semibold': '600',
                'bold': '700',
                'extrabold': '800',
                'black': '900',
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    foreground: "hsl(var(--success-foreground))",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            letterSpacing: {
                'ultra-wide': '0.1em',
                'extra-wide': '0.05em',
                'wide': '0.025em',
                'normal': '0em',
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "text-gradient": "linear-gradient(135deg, #ffffff 0%, #e5e7eb 50%, #9ca3af 100%)",
                "text-gradient-primary": "linear-gradient(135deg, #FF6B35 0%, #FFD23F 100%)",
            },
            boxShadow: {
                sm: '0 1px 2px 0 rgb(var(--shadow-color) / 0.05)',
                DEFAULT: '0 1px 3px 0 rgb(var(--shadow-color) / 0.1), 0 1px 2px -1px rgb(var(--shadow-color) / 0.1)',
                md: '0 4px 6px -1px rgb(var(--shadow-color) / 0.1), 0 2px 4px -2px rgb(var(--shadow-color) / 0.1)',
                lg: '0 10px 15px -3px rgb(var(--shadow-color) / 0.1), 0 4px 6px -4px rgb(var(--shadow-color) / 0.1)',
                'lg-hover': '0 20px 25px -5px rgb(var(--shadow-color) / 0.15), 0 8px 10px -6px rgb(var(--shadow-color) / 0.15)',
                xl: '0 20px 25px -5px rgb(var(--shadow-color) / 0.1), 0 8px 10px -6px rgb(var(--shadow-color) / 0.1)',
                '2xl': '0 25px 50px -12px rgb(var(--shadow-color) / 0.25)',
                inner: 'inset 0 2px 4px 0 rgb(var(--shadow-color) / 0.05)',
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "slide-up": "slide-up 0.4s ease-out",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
    // Optimize for production builds
    future: {
        hoverOnlyWhenSupported: true,
    },
};
export default config;
