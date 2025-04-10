export default {
	plugins: {
		'@tailwindcss/postcss': {}
		// ...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {}) // we have currently disabled cssnano as it doesn't play along with container queries. This is however fixed in Svelte 5 (see: https://github.com/sveltejs/svelte/issues/10369#issuecomment-1983169720)
	}
};
