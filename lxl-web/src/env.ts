import { defineEnvVars } from '@sveltejs/kit/env';

// @migration-task Review usage of dynamic environment variables. They fall back to the empty string if not present, which may not be what you want.
export const variables = defineEnvVars({
	HOLDING_STATUS_URL: { schema: (input) => input ?? '' },
	API_URL: { schema: (input) => input ?? '' },
	AUXD_SECRET: { schema: (input) => input ?? '' },
	PUBLIC_FJARRLAN_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_MATOMO_ID: { public: true, schema: (input) => input ?? '' },
	PUBLIC_MATOMO_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_DEBUG_SUPERSEARCH: { public: true, schema: (input) => input ?? '' }
});
