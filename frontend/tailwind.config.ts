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
                "hero-gradient": "linear-gradient(135deg, #004E89 0%, #1A1A2E 50%, #FF6B35 100%)",
                "mesh-gradient": "radial-gradient(at 27% 37%, hsla(215, 98%, 61%, 0.3) 0px, transparent 50%), radial-gradient(at 97% 21%, hsla(125, 98%, 72%, 0.2) 0px, transparent 50%), radial-gradient(at 52% 99%, hsla(354, 98%, 61%, 0.3) 0px, transparent 50%)",
                "card-gradient": "linear-gradient(145deg, rgba(26, 26, 46, 0.8) 0%, rgba(26, 26, 46, 0.6) 100%)",
                "text-gradient": "linear-gradient(135deg, #ffffff 0%, #e5e7eb 50%, #9ca3af 100%)",
                "text-gradient-primary": "linear-gradient(135deg, #FF6B35 0%, #FFD23F 100%)",
                "border-gradient-primary": "linear-gradient(135deg, #FF6B35, #E85A2A)",
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
                "shimmer": {
                    "0%": { transform: "translateX(-100%)" },
                    "100%": { transform: "translateX(100%)" },
                },
                "glow": {
                    "0%, 100%": { boxShadow: "0 0 20px rgba(255, 107, 53, 0.3)" },
                    "50%": { boxShadow: "0 0 30px rgba(255, 107, 53, 0.6)" },
                },
                "ripple": {
                    "0%": { transform: "scale(0)", opacity: "0.5" },
                    "100%": { transform: "scale(4)", opacity: "0" },
                },
                "gradient-shift": {
                    "0%": { backgroundPosition: "0% 50%" },
                    "50%": { backgroundPosition: "100% 50%" },
                    "100%": { backgroundPosition: "0% 50%" },
                },
                "stagger-in": {
                    "0%": { opacity: "0", transform: "translateY(30px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "float-orb": {
                    "0%, 100%": { transform: "translateY(0px) translateX(0px)" },
                    "33%": { transform: "translateY(-20px) translateX(10px)" },
                    "66%": { transform: "translateY(10px) translateX(-10px)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.3s ease-out",
                "slide-up": "slide-up 0.4s ease-out",
                "shimmer": "shimmer 2s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
                "ripple": "ripple 0.6s linear",
                "gradient-shift": "gradient-shift 3s ease-in-out infinite",
                "stagger-in": "stagger-in 0.8s ease forwards",
                "float-orb": "float-orb 20s ease-in-out infinite",
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
