import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        "chat-bg": "rgb(var(--chat-bg) / <alpha-value>)",
        "chat-message-bg": "rgb(var(--chat-message-bg) / <alpha-value>)",
        "border-color": "rgb(var(--border-color) / <alpha-value>)",
        "text-secondary": "rgb(var(--text-secondary) / <alpha-value>)",
        "input-bg": "rgb(var(--input-bg) / <alpha-value>)",
        "input-text": "rgb(var(--input-text) / <alpha-value>)",
        "select-bg": "rgb(var(--select-bg) / <alpha-value>)",
        "select-text": "rgb(var(--select-text) / <alpha-value>)",
        "select-option-bg": "rgb(var(--select-option-bg) / <alpha-value>)",
        "select-option-text": "rgb(var(--select-option-text) / <alpha-value>)",
        "textarea-bg": "rgb(var(--textarea-bg) / <alpha-value>)",
        "textarea-text": "rgb(var(--textarea-text) / <alpha-value>)",
        "accent-primary": "rgb(var(--accent-primary) / <alpha-value>)",
        "accent-secondary": "rgb(var(--accent-secondary) / <alpha-value>)",
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(to bottom, rgb(var(--chat-bg)), rgb(var(--background)))',
      },
      keyframes: {
        loading: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(200%)' }
        }
      },
    },
  },
  plugins: [],
} satisfies Config;
