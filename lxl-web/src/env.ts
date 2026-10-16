import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	ID_URL: {
		schema: (input) => input ?? '',
		description: 'Where to fetch id.kb.se resources'
	},
	API_URL: { schema: (input) => input ?? '' },
	HOLDING_STATUS_URL: { schema: (input) => input ?? '' },
	AUXD_SECRET: { schema: (input) => input ?? '' },
	USE_LOCAL_DISPLAY_JSONLD: {
		schema: (input) => input ?? '',
		description:
			'To use a local Displayfile, you need the Libris definitions repo alongside lxlviewer'
	},
	SUBSITES: { schema: (input) => input ?? '' },
	PUBLIC_FJARRLAN_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_MATOMO_ID: { public: true, schema: (input) => input ?? '' },
	PUBLIC_MATOMO_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_DEBUG_SUPERSEARCH: {
		public: true,
		schema: (input) => input ?? '',
		description: 'Log supersearch operations in the console'
	}
});
