import type { Config } from "tailwindcss";
import formsPlugin from '@tailwindcss/forms';
import containerQueriesPlugin from '@tailwindcss/container-queries';

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Gumroad-inspired Neo-Brutalism palette */
        "surface": "#FFFFFF",
        "surface-dim": "#F4F3F0",
        "surface-variant": "#f5f5f5",
        "surface-container-lowest": "#ffffff",
        "surface-bright": "#ffffff",
        "surface-container-low": "#fafafa",
        "surface-container": "#f5f5f5",
        "surface-container-high": "#f0f0f0",
        "surface-container-highest": "#e8e8e8",

        "on-surface": "#000000",
        "on-background": "#000000",
        "background": "#F4F3F0",
        "inverse-surface": "#000000",
        "inverse-on-surface": "#ffffff",

        "primary": "#B794F6",
        "primary-container": "#B794F6",
        "primary-fixed": "#B794F6",
        "primary-fixed-dim": "#FFB8EF",
        "on-primary": "#000000",
        "on-primary-container": "#000000",
        "on-primary-fixed": "#000000",
        "on-primary-fixed-variant": "#000000",
        "inverse-primary": "#B794F6",
        "surface-tint": "#B794F6",

        "secondary": "#333333",
        "secondary-container": "#f5f5f5",
        "secondary-fixed": "#f5f5f5",
        "secondary-fixed-dim": "#e0e0e0",
        "on-secondary": "#ffffff",
        "on-secondary-container": "#000000",
        "on-secondary-fixed": "#000000",
        "on-secondary-fixed-variant": "#333333",

        "tertiary": "#666666",
        "tertiary-container": "#f0f0f0",
        "tertiary-fixed": "#f5f5f5",
        "tertiary-fixed-dim": "#e0e0e0",
        "on-tertiary": "#ffffff",
        "on-tertiary-container": "#000000",
        "on-tertiary-fixed": "#000000",
        "on-tertiary-fixed-variant": "#333333",

        "error": "#FF6B6B",
        "error-container": "#FFE0E0",
        "on-error": "#000000",
        "on-error-container": "#000000",

        "outline": "#000000",
        "outline-variant": "#e0e0e0",
      },
      borderRadius: {
        /* Gumroad-style: subtle rounding, NOT square */
        "DEFAULT": "6px",
        "sm": "4px",
        "md": "8px",
        "lg": "10px",
        "xl": "14px",
        "2xl": "18px",
        "3xl": "24px",
        "4xl": "32px",
        "full": "9999px",
      },
      spacing: {
        "gutter": "24px",
        "unit": "8px",
        "stack-depth": "12px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
        "container-max": "1200px"
      },
      fontFamily: {
        "body-md": ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        "headline-xl": ["var(--font-hanken)", "Hanken Grotesk", "sans-serif"],
        "headline-lg": ["var(--font-hanken)", "Hanken Grotesk", "sans-serif"],
        "headline-lg-mobile": ["var(--font-hanken)", "Hanken Grotesk", "sans-serif"],
        "label-sm": ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        "mono": ["var(--font-jetbrains)", "JetBrains Mono", "ui-monospace", "monospace"]
      },
      fontSize: {
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "headline-xl": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.03em", "fontWeight": "900" }],
        "headline-lg": ["32px", { "lineHeight": "1.15", "letterSpacing": "-0.02em", "fontWeight": "800" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "1.2", "fontWeight": "800" }],
        "label-sm": ["13px", { "lineHeight": "1", "letterSpacing": "0.04em", "fontWeight": "700" }]
      },
      boxShadow: {
        /* Gumroad-style: smaller offsets, zero blur */
        "extruded-heavy": "6px 6px 0px 0px #000000",
        "extruded": "4px 4px 0px 0px #000000",
        "extruded-sm": "2px 2px 0px 0px #000000",
        "recessed-deep": "inset 2px 2px 0px rgba(0,0,0,0.06)",
        "recessed": "inset 1px 1px 0px rgba(0,0,0,0.04)",
        "machined-btn": "4px 4px 0px 0px #000000",
        "machined-btn-pressed": "1px 1px 0px 0px #000000",
        "glass-panel": "4px 4px 0px 0px #000000",
      },
      borderWidth: {
        "1.5": "1.5px",
        "2": "2px",
      }
    },
  },
  plugins: [
    formsPlugin,
    containerQueriesPlugin,
  ],
};
export default config;
