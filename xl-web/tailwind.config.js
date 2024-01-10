/** @type {import('tailwindcss').Config} */

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		screens: {
			// sm: '480px' etc
		},
		colors: {
			blue: '#1fb6ff',
			orange: '#ff7849',
			green: '#13ce66',
			gray: {
				100: '#f7fafc',
				// ...
				900: '#1a202c'
			}
		},
		fontSize: {
			sm: '0.8rem',
			base: '1rem',
			xl: '1.25rem',
			'2xl': '1.563rem',
			'3xl': '1.953rem',
			'4xl': '2.441rem',
			'5xl': '3.052rem'
		},
		fontFamily: {
			// 'sans': ['roboto-flex', 'system-ui', ...],
		},
		extend: {}
	},
	plugins: []
};
