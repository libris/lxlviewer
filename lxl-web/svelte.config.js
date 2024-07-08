import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import trimSiblingWhitespaces from './src/lib/preprocessors/trimSiblingWhitespaces.js';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [vitePreprocess(), trimSiblingWhitespaces({ filenames: ['DecoratedData.svelte'] })],

	kit: {
		adapter: adapter()
	}
};

export default config;
