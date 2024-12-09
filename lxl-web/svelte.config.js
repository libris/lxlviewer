import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { join } from 'node:path';
import trimSiblingWhitespaces from './src/lib/preprocessors/trimSiblingWhitespaces.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [
		vitePreprocess(),
		mdsvex({
			extensions: ['.md'],
			layout: join(import.meta.dirname, './src/lib/components/MarkdownContent.svelte')
		}),
		trimSiblingWhitespaces({ filenames: ['DecoratedData.svelte'] })
	],
	kit: {
		adapter: adapter(),
		paths: {
			relative: false
		},
		csp: {
			directives: {
				'default-src': ['self'],
				// FIXME !!!!!!
				'script-src': ['unsafe-eval', 'self', 'https://analytics.kb.se'],
				// FIXME !!!!!!
				'connect-src': [
					'self',
					'https://analytics.kb.se',
					'https://libris-qa.kb.se/sparql',
					'http://prefix.cc'
				],
				'style-src': ['self', 'unsafe-inline'],
				'base-uri': ['self'],
				'form-action': ['self'],
				'frame-ancestors': ['none'],
				'img-src': ['self', 'kb.se', '*.kb.se', 'data:']
			}
		}
	}
};

export default config;
