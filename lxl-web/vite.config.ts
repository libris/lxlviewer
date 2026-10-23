import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { join } from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import Icons from 'unplugin-icons/vite';
import { FileSystemIconLoader } from 'unplugin-icons/loaders';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			extensions: ['.svelte', '.md'],
			preprocess: [
				vitePreprocess(),
				mdsvex({
					extensions: ['.md'],
					layout: join(import.meta.dirname, './src/lib/components/MarkdownContent.svelte')
				})
			],
			compilerOptions: { experimental: { async: true } },
			adapter: adapter(),
			paths: { relative: false },
			csp: {
				directives: {
					'default-src': ['self'],
					'script-src': ['self', 'https://analytics.kb.se'],
					'connect-src': ['self', 'https://analytics.kb.se'],
					'style-src': ['self', 'unsafe-inline'],
					'base-uri': ['self'],
					'form-action': ['self'],
					'frame-ancestors': ['self', 'http://*.kb.se', 'http://*.localhost:*'],
					'img-src': ['self', 'kb.se', '*.kb.se', 'data:'],
					'font-src': ['self', 'https://cdn.kb.se/']
				}
			},
			experimental: { remoteFunctions: true }
		}),

		Icons({
			compiler: 'svelte',
			scale: 1,
			customCollections: {
				custom: FileSystemIconLoader('./src/lib/assets/icons', (svg) =>
					svg.replace(/^<svg /, '<svg fill="currentColor" ')
				)
			}
		})
	],
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
