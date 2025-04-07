import { type PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
	projects: [
		{
			name: 'desktop',
			use: {
				viewport: {
					width: 1920,
					height: 1080
				}
			}
		}
	],
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173,
		reuseExistingServer: !process.env.CI
	},
	retries: 1,
	use: {
		trace: process.env.CI ? 'on-first-retry' : 'off'
	},
	testDir: 'tests',
	testMatch: /(.+\.)?(test|spec)\.[jt]s/
};

export default config;
