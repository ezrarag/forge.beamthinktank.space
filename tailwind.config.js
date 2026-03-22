/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forge: {
          steel: '#1a1a2e',
          amber: '#f5a623',
          white: '#ffffff',
          ink: '#090b14',
          smoke: '#9ea3b0',
          line: 'rgba(255,255,255,0.12)',
        },
      },
      boxShadow: {
        forge: '0 24px 80px rgba(0, 0, 0, 0.32)',
      },
      backgroundImage: {
        'forge-grid':
          'linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}

