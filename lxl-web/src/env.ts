import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

export const DEFAULT_SITE_ID = 'default';

const SiteConfigSchema = v.object({
	searchSite: v.optional(v.pipe(v.string(), v.url())),
	matomoId: v.optional(
		v.pipe(
			v.union([v.string(), v.number()]),
			v.transform(Number),
			v.check((id) => Number.isInteger(id) && id > 0, 'matomoId must be a positive integer')
		)
	)
});

const SitesSchema = v.pipe(
	v.record(v.pipe(v.string(), v.nonEmpty()), SiteConfigSchema),
	v.check(
		(sites) =>
			Object.entries(sites).every(([id, site]) => id === DEFAULT_SITE_ID || site.searchSite),
		`every site except "${DEFAULT_SITE_ID}" must have a searchSite`
	)
);

export interface SiteConfig extends v.InferOutput<typeof SiteConfigSchema> {
	id: string;
}

/**
 * Parses SITES into a map of site id -> config. The "default" entry (the main site) is used
 * for any host that doesn't match another site id, and is always present in the result.
 */
function parseSites(input: string | undefined): Record<string, SiteConfig> {
	let json: unknown = {};
	if (input?.trim()) {
		try {
			json = JSON.parse(input);
		} catch (e) {
			throw new Error(`SITES is not valid JSON: ${(e as Error).message}`);
		}
	}
	const result = v.safeParse(SitesSchema, json);
	if (!result.success) {
		const issues = result.issues
			.map((i) => `${v.getDotPath(i) ?? '(root)'}: ${i.message}`)
			.join('; ');
		throw new Error(`SITES is invalid: ${issues}`);
	}
	const sites: Record<string, SiteConfig> = {
		[DEFAULT_SITE_ID]: { id: DEFAULT_SITE_ID }
	};
	for (const [id, site] of Object.entries(result.output)) {
		sites[id] = { id, ...site };
	}
	return sites;
}

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
	SITES: {
		schema: parseSites,
		description:
			'JSON object mapping site id (subdomain, or "default" for the main site) to site config, e.g. {"default":{"matomoId":"1"},"suecia":{"searchSite":"https://suecia.kb.se/","matomoId":"12"}}'
	},
	PUBLIC_FJARRLAN_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_MATOMO_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_DEBUG_SUPERSEARCH: {
		public: true,
		schema: (input) => input ?? '',
		description: 'Log supersearch operations in the console'
	}
});
