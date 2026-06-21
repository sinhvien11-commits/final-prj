export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'primary-fixed':          '#9EFF00',
        'primary-fixed-dim':      '#88dc00',
        'primary':                '#ffffff',
        'secondary':              '#c8c6c5',
        'background':             '#0B0B0B',
        'surface':                '#131313',
        'surface-container':      '#1f1f1f',
        'surface-container-high': '#2a2a2a',
        'surface-variant':        '#353535',
        'on-surface':             '#e2e2e2',
        'on-surface-variant':     '#c0cbad',
        'error':                  '#ffb4ab',
      },
      spacing: {
        'stack-sm':      '8px',
        'stack-md':      '16px',
        'stack-lg':      '24px',
        'margin-mobile': '20px',
        'gutter':        '12px',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
    },
  },
}
