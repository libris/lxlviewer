import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { enhancedImages } from '@sveltejs/enhanced-img';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		enhancedImages(),
		sveltekit(),
		Icons({
			compiler: 'svelte',
			scale: 1
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
