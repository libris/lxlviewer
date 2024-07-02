import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		Icons({
			compiler: 'svelte',
			scale: 1
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
