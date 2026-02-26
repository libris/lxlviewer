import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	retries: 1,
	use: {
		trace: process.env.CI ? 'on-first-retry' : 'off'
	},
	testDir: 'e2e',
	expect: {
		timeout: 10_000
	}
});
