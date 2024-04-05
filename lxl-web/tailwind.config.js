/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			transparent: 'transparent',
			white: 'rgb(var(--color-white) / <alpha-value>)',
			primary: 'rgb(var(--color-primary) / <alpha-value>)',
			'accent-light': 'rgb(var(--color-accent-light) / <alpha-value>)',
			'accent-dark': 'rgb(var(--color-accent-dark) / <alpha-value>)',
			highlight: 'rgb(var(--color-highlight) / <alpha-value>)'
		},
		textColor: {
			primary: 'rgb(var(--text-primary) / 1)',
			'primary-inv': 'rgb(var(--text-primary-inv) / 1)',
			secondary: 'rgb(var(--text-primary) / 0.8)',
			'secondary-inv': 'rgb(var(--text-primary-inv) / 0.8)',
			link: 'rgb(var(--text-link) / 1)',
			disabled: 'rgb(var(--text-primary) / 0.6)'
		},
		backgroundColor: {
			main: 'rgb(var(--bg-main) / 1)',
			head: 'rgb(var(--bg-head) / 1)',
			positive: 'rgb(var(--bg-positive) / 1)',
			'positive-inv': 'rgb(var(--bg-positive-inv) / 1)',
			cards: 'rgb(var(--bg-cards) / 1)',
			pill: 'rgb(var(--bg-pill) / <alpha-value>)'
		},
		opacity: {
			80: '.80',
			64: '.64',
			48: '.48',
			40: '.40',
			32: '.32',
			24: '.24',
			16: '.16',
			8: '.08',
			4: '.04'
		},
		fontSize: ({ theme }) => ({
			xs: ['0.75rem', theme('lineHeight.normal')],
			sm: ['0.875rem', theme('lineHeight.normal')],
			base: ['1rem', theme('lineHeight.normal')],
			lg: ['1.25rem', theme('lineHeight.normal')],
			xl: ['1.5rem', theme('lineHeight.tight')],
			'2xl': ['2rem', theme('lineHeight.tight')],
			'3xl': ['2.5rem', theme('lineHeight.tight')],
			'4xl': ['3rem', theme('lineHeight.tight')],
			'5xl': ['4rem', theme('lineHeight.tight')]
		}),
		fontFamily: {
			sans: ['"Roboto Flex"', 'sans-serif'],
			condensed: [
				'"Roboto Flex", sans-serif',
				{
					fontVariationSettings: '"wdth" 60'
				}
			]
		},
		fontWeight: {
			normal: '400',
			bold: '700',
			extrabold: '800'
		},
		lineHeight: {
			normal: '1.4',
			tight: '1.2',
			none: '0'
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
			padding: {
				DEFAULT: '1rem',
				sm: '2rem'
			}
		},
		screens: {
			// figma screens:
			// sm: '375px',
			// md: '1024px',
			// lg: '1440px'

			xs: '375px',
			sm: '640px',
			md: '1024px',
			lg: '1440px',
			xl: '1536px'
		},
		extend: {
			maxWidth: {
				content: '78rem'
			}
		}
	},
	plugins: [
		/** @type {import('tailwindcss/types/config').PluginCreator} */
		({ addUtilities }) => {
			addUtilities({
				// typography 1-6 variants in design
				'.text-1-regular': {
					'@apply text-xs font-normal': {}
				},
				'.text-1-cond-bold': {
					'@apply text-xs font-condensed font-bold': {}
				},
				'.text-1-cond-caps': {
					'@apply text-xs font-condensed font-normal uppercase tracking-wide': {}
				},
				'.text-2-regular': {
					'@apply text-sm font-normal': {}
				},
				'.text-2-cond-bold': {
					'@apply text-sm font-condensed font-bold': {}
				},
				'.text-3-regular': {
					'@apply text-base font-normal': {}
				},
				'.text-3-cond-bold': {
					'@apply text-base font-condensed font-bold': {}
				},
				'.text-4-regular': {
					'@apply text-lg font-normal': {}
				},
				'.text-4-cond-bold': {
					'@apply text-lg font-condensed font-bold': {}
				},
				'.text-5-cond-extrabold': {
					'@apply text-xl font-condensed font-extrabold': {}
				},
				'.text-6-cond-extrabold': {
					'@apply text-2xl md:text-3xl font-condensed font-extrabold': {}
				},
				'.text-7-cond-extrabold': {
					'@apply text-3xl md:text-4xl lg:text-5xl font-condensed font-extrabold': {}
				},
				// other utility classes
				'.gradient-primary': {
					'@apply bg-gradient-to-b from-[#7B4C1E] to-[#674019]': {}
				}
			});
		}
	]
};
