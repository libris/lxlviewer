import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_DEBUG_SUPERSEARCH: { public: true, schema: (input) => input ?? '' }
});
