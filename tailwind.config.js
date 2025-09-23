/** @type {import('tailwindcss').Config} */
import daisyui from "daisyui";

export default {
  content: ["./src/**/*.{ts,tsx,js,jsx,mdx}"],
  theme: { extend: {} },
  plugins: [daisyui],
  daisyui: {
    themes: ["luxury"], // or ["light", "dark"] if you want no theme
  },
};
