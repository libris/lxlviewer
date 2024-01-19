/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			transparent: 'transparent',
			white: 'rgb(var(--color-white) / <alpha-value>)',
			primary: 'rgb(var(--color-primary) / <alpha-value>)',
			'accent-light': 'rgb(var(--color-accent-light) / <alpha-value>)',
			'accent-dark': 'rgb(var(--color-accent-dark) / <alpha-value>)',
			background: 'rgb(var(--color-background) / <alpha-value>)',
			highlight: 'rgb(var(--color-highlight) / <alpha-value>)',
		},
		opacity: {
			'80': '.80',
			'64': '.64',
			'48': '.48',
			'40': '.40',
			'32': '.32',
			'24': '.24',
			'16': '.16',
			'8': '.08',
			'4': '.04'
		},
		fontSize: ({ theme }) => ({
			xs: ['0.75rem', theme('lineHeight.normal')],
			sm: ['0.875rem', theme('lineHeight.normal')],
			base: ['1rem', theme('lineHeight.normal')],
			xl: ['1.5rem', theme('lineHeight.tight')],
			'2xl': ['2rem', theme('lineHeight.tight')],
			'3xl': ['2.5rem', theme('lineHeight.tight')],
			'4xl': ['4rem', theme('lineHeight.tight')],
		}),
		fontFamily: {
			sans: ['"Roboto Flex"', 'sans-serif'],
      condensed: [
        '"Roboto Flex", sans-serif',
        {
          fontVariationSettings: '"wdth" 60',
        },
      ],
    },
		fontWeight: {
			normal: '400',
			bold: '700',
			extrabold: '800'
		},
		lineHeight: {
			normal: '1.4',
			tight: '1.2'
		},
		letterSpacing: {
			normal: '0',
			wide: '0.03rem'
		},
		borderRadius: {
			none: '0px',
			sm: '4px',
			md: '8px',
			full: '9999px'
		},
		container: {
			center: true,
			padding: '2rem'
		},
		extend: {}
	},
	plugins: [
		/** @type {import('tailwindcss/types/config').PluginCreator} */
    ({ addUtilities }) => {
      addUtilities({
				// typography 1-6 variants in design
				'.text-1-regular': {
					'@apply text-xs': {}
				},
				'.text-1-cond-bold': {
					'@apply text-xs font-condensed font-bold': {}
				},
				'.text-1-cond-caps': {
					'@apply text-xs font-condensed uppercase tracking-wide': {}
				},
				'.text-2-regular': {
					'@apply text-sm': {}
				},
				'.text-2-cond-bold': {
					'@apply text-sm font-condensed font-bold': {}
				},
				'.text-3-regular': {
					'@apply text-base': {}
				},
				'.text-3-cond-bold': {
					'@apply text-base font-condensed font-bold': {}
				},
				'.text-4-cond-extrabold': {
					'@apply text-xl font-condensed font-extrabold': {}
				},
				'.text-5-cond-extrabold': {
					'@apply text-2xl font-condensed font-extrabold': {}
				},
				'.text-6-cond-extrabold': {
					'@apply text-3xl lg:text-4xl font-condensed font-extrabold': {}
				},
				// other utility classes
				'.gradient-primary': {
					'@apply bg-gradient-to-b from-[#7A4D1F] to-[#66401A]': {}
				},
      });
    }
	]
};