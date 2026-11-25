/** 自 index.html 原 inline tailwind.config 逐字搬出，僅補上 content 掃描範圍 */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      colors: {
        obsidian: '#06080e',
        panel: '#0c101b',
        gold: {
          300: '#f7e0a3',
          400: '#ecc573',
          500: '#d4a34b',
        },
      },
    },
  },
};
