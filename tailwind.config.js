module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,css}'],
  theme: {
    extend: {
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle, #ff9a9e, #ffcabb, #fab3e6, #a18cd1)',
      },
      keyframes: {
        'radial-gradient': {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        }
      },
      animation: {
        'radial-gradient': 'radial-gradient 10s ease-in-out infinite',
        fadeIn: 'fadeIn 1.5s ease-out',
        'fadeIn-slow': 'fadeIn 2s ease-out',
      },
      colors: {
        customBlue: '#1E40AF',
        'cta': '#FF5733',
        'cta-hover': '#C70039',
        'highlight': '#007BFF',
        'footer': '#333',
      }
    },
  },
  plugins: [],
};
