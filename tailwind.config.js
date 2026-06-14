/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Brand Identity colors from PDF Manual
        "primary": "#16A34A",         // Verde Movilidad (Primary Actions)
        "background": "#0F1E2E",      // Azul Marino Profundo (Main background)
        "surface": "#0F1E2E",         // Azul Marino Profundo
        "surface-container": "#182635",      // Lighter navy for cards
        "surface-container-low": "#11202f",  // Darker navy
        "surface-container-high": "#213243", // Lighter navy
        "surface-container-highest": "#2c3e52",
        "on-background": "#FFFFFF",
        "on-surface": "#FFFFFF",
        "on-surface-variant": "#64748B", // Gris Acero
        "surface-variant": "#203246",
        
        "tertiary": "#F59E0B",        // Ámbar Energía (Warnings/Maintenance)
        "secondary": "#64748B",       // Gris Acero
        "primary-container": "#16A34A",
        "on-primary-container": "#FFFFFF",
        "on-primary": "#FFFFFF",
        
        "outline": "#64748B",
        "outline-variant": "#2c3e52",
        
        // Semantic states
        "error": "#DC2626",           // Semantic Red
        "info": "#0EA5E9",            // Semantic Blue
        "success": "#16A34A",         // Semantic Green
        
        // Material Design backward compatibility tags (to prevent breaking other elements)
        "primary-fixed": "#16A34A",
        "surface-container-lowest": "#0b141f",
        "on-tertiary-container": "#0F1E2E",
        "error-container": "#DC2626",
        "on-error": "#FFFFFF",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#F59E0B",
        "surface-dim": "#0a1520",
        "surface-bright": "#1d2d3e",
        "secondary-container": "#203246",
        "on-secondary-container": "#FFFFFF"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "md": "16px",
        "margin-mobile": "16px",
        "lg": "24px",
        "sm": "8px",
        "margin-desktop": "64px",
        "xs": "4px",
        "gutter": "16px",
        "base": "4px",
        "xl": "32px"
      },
      fontFamily: {
        "headline-md": ["Poppins", "sans-serif"],
        "label-md": ["Inter", "sans-serif"],
        "headline-lg-mobile": ["Poppins", "sans-serif"],
        "headline-md-mobile": ["Poppins", "sans-serif"],
        "headline-sm": ["Poppins", "sans-serif"],
        "headline-xl": ["Poppins", "sans-serif"],
        "body-lg": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "headline-lg": ["Poppins", "sans-serif"],
        "body-md": ["Inter", "sans-serif"]
      },
      fontSize: {
        "headline-md": ["24px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "label-md": ["14px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "headline-lg-mobile": ["28px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "headline-md-mobile": ["22px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "headline-xl": ["48px", { "lineHeight": "1.2", "fontWeight": "700" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "headline-lg": ["32px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "1.6", "fontWeight": "400" }]
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
}
