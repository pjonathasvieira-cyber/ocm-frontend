/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0D0D0D',
        'bg-card': '#1A1A1A',
        'bg-elevated': '#222222',
        'accent': '#C9A050',
        'accent-muted': '#8A6E35',
        'text-primary': '#F0F0F0',
        'text-secondary': '#888888',
        'text-muted': '#555555',
        'border': '#2A2A2A',
        'success': '#4CAF50',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'xs': ['11px', { lineHeight: '1.4' }],
        'sm': ['14px', { lineHeight: '1.5' }],
        'base': ['16px', { lineHeight: '1.75' }],
        'lg': ['20px', { lineHeight: '1.6' }],
        'title': ['22px', { lineHeight: '1.3', fontWeight: '700' }],
        'title-lg': ['28px', { lineHeight: '1.3', fontWeight: '700' }],
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0em',
        'wide': '0.05em',
        'wider': '0.1em',
        'widest': '0.15em',
      },
      borderRadius: {
        'none': '0',
        'xs': '2px',
        'sm': '4px',
        'base': '6px',
        'md': '8px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
      },
      maxWidth: {
        'mobile': '480px',
      },
    },
  },
  plugins: [],
}
