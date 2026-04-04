/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./context/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#753eb5",
        "primary-container": "#bd87ff",
        "primary-fixed": "#bd87ff",
        "primary-fixed-dim": "#b079f3",
        "primary-dim": "#6830a8",

        "on-primary": "#faefff",
        "on-primary-container": "#340064",
        "on-primary-fixed": "#000000",
        "on-primary-fixed-variant": "#41007a",

        secondary: "#006b25",
        "secondary-container": "#67f67d",
        "secondary-fixed": "#67f67d",
        "secondary-fixed-dim": "#58e770",
        "secondary-dim": "#005d1f",

        "on-secondary": "#d0ffcc",
        "on-secondary-container": "#00591d",
        "on-secondary-fixed": "#004414",
        "on-secondary-fixed-variant": "#006422",

        tertiary: "#785500",
        "tertiary-container": "#feb700",
        "tertiary-fixed": "#feb700",
        "tertiary-fixed-dim": "#ecaa00",
        "tertiary-dim": "#694a00",

        "on-tertiary": "#fff1de",
        "on-tertiary-container": "#533a00",
        "on-tertiary-fixed": "#392700",
        "on-tertiary-fixed-variant": "#5f4200",

        error: "#b41340",
        "error-dim": "#a70138",
        "error-container": "#f74b6d",
        "on-error": "#ffefef",
        "on-error-container": "#510017",

        background: "#fff3fe",
        "on-background": "#3d2549",

        surface: "#fff3fe",
        "surface-bright": "#fff3fe",
        "surface-dim": "#efc6ff",
        "surface-tint": "#753eb5",
        "surface-variant": "#f3d1ff",

        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#fdebff",
        "surface-container": "#f9e0ff",
        "surface-container-high": "#f6d9ff",
        "surface-container-highest": "#f3d1ff",

        "on-surface": "#3d2549",
        "on-surface-variant": "#6c5279",

        outline: "#896d95",
        "outline-variant": "#c2a2ce",

        "inverse-surface": "#1a0426",
        "inverse-primary": "#bb83ff",
        "inverse-on-surface": "#b192bd",
      },
      fontFamily: {
        headline: ["Manrope_800ExtraBold", "System"],
        body: ["Inter_400Regular", "System"],
        label: ["Inter_600SemiBold", "System"],
        sans: ["Inter_400Regular", "System"],
      },
      boxShadow: {
        ambient: "0 40px 40px rgb(61 37 73 / 0.06)",
        "ambient-soft": "0 40px 40px rgb(61 37 73 / 0.04)",
      },
    },
  },
  plugins: [],
};
