/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue,svelte,md,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: {
          950: '#07060b',
          900: '#0b0a12',
          850: '#0f0e18',
          800: '#141220',
          700: '#1c1a2b',
          600: '#2a2740',
        },
        accent: {
          DEFAULT: '#a855f7',
          pink: '#e879f9',
          soft: '#c4b5fd',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 60px -15px rgba(168, 85, 247, 0.55)',
        card: '0 8px 30px -10px rgba(0,0,0,0.6)',
        nav: '0 10px 40px -8px rgba(0,0,0,0.7)',
      },
      backgroundImage: {
        'hero-gradient':
          'radial-gradient(120% 100% at 20% 0%, #3b1866 0%, #1a0f2e 40%, #07060b 75%)',
        'card-sheen':
          'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 40%)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        scaleIn: {
          '0%': { opacity: 0, transform: 'scale(0.96) translateY(8px)' },
          '100%': { opacity: 1, transform: 'scale(1) translateY(0)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        fadeIn: 'fadeIn 0.2s ease-out',
        scaleIn: 'scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};
