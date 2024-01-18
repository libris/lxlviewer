/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		colors: {
			white: {
				DEFAULT: '#FFFFFF',
				80: '#FFFFFFCC',
				64: '#FFFFFFA3'
			},
			beige: '#F8F6F1',
			greenLight: {
				DEFAULT: '#D5E5DC',
				40: '#D5E5DC66'
			},
			greenDark: {
				DEFAULT: '#426B54',
				32: '#426B5452'
			},
			brown: {
				DEFAULT: '#523314',
				80: '#523314CC',
				40: '#52331466',
				16: '#52331429',
				8: '#52331414',
				4: '#5233140A'
			},
			pink: {
				DEFAULT: '#ECD6C0',
				24: '#ECD6C03D'
			}
		},
		fontSize: {
			xs: '0.75rem',
			sm: '0.875rem',
			base: '1rem',
			xl: '1.5rem',
			'2xl': '2rem',
			'3xl': '2.5rem',
			'4xl': '4rem'
		},
		fontFamily: {
			sans: ['Roboto Flex', 'sans-serif']
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
				// custom utility classes here (for autocomplete)
        '.font-condensed': {
					'font-stretch': '60%'
        },
				// typography size/variants in design
				// 1
				'.text-s1-regular': {
					'@apply text-xs leading-normal': {}
				},
				'.text-s1-cond-bold': {
					'@apply text-s1-regular font-condensed font-bold': {}
				},
				'.text-s1-cond-caps': {
					'@apply text-s1-regular font-condensed uppercase tracking-wide': {}
				},
				// 2
				'.text-s2-regular': {
					'@apply text-sm leading-normal': {}
				},
				'.text-s2-cond-bold': {
					'@apply text-s2-regular font-condensed font-bold': {}
				},
				// 3
				'.text-s3-regular': {
					'@apply text-base leading-normal': {}
				},
				'.text-s3-cond-bold': {
					'@apply text-s3-regular font-condensed font-bold': {}
				},
				// 4
				'.text-s4-cond-extrabold': {
					'@apply text-xl font-condensed font-extrabold leading-tight': {}
				},
				// 5
				'.text-s5-cond-extrabold': {
					'@apply text-2xl font-condensed font-extrabold leading-tight': {}
				},
				// 6
				'.text-s6-cond-extrabold': {
					'@apply text-3xl lg:text-4xl font-condensed font-extrabold leading-tight': {}
				},
      });
    }
	]
};
