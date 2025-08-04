/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        // Otros breakpoints estándar se mantienen
        // sm: '640px',
        // md: '768px', 
        // lg: '1024px',
        // xl: '1280px',
        // 2xl: '1536px'
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      fontSize: {
        // Escalas de texto responsive
        'xs-responsive': 'clamp(0.75rem, 2vw, 0.875rem)',
        'sm-responsive': 'clamp(0.875rem, 2.5vw, 1rem)',
        'base-responsive': 'clamp(1rem, 3vw, 1.125rem)',
        'lg-responsive': 'clamp(1.125rem, 3.5vw, 1.25rem)',
        'xl-responsive': 'clamp(1.25rem, 4vw, 1.5rem)',
      },
      maxWidth: {
        // Máximos anchos para zoom alto
        'screen-xs': '475px',
        'zoom-safe': '90vw',
      },
      minHeight: {
        'touch-target': '44px', // Tamaño mínimo para touch targets
      }
    },
  },
  plugins: [],
}
