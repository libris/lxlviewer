import { defineEnvVars } from '@sveltejs/kit/env';
import * as v from 'valibot';

export const DEFAULT_SITE_ID = 'default';

/** Lowercases and strips port and trailing dot, e.g. "Suecia.Libris.KB.se:443" -> "suecia.libris.kb.se" */
export function normalizeHost(host: string): string {
	return host.trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
}

const HostSchema = v.pipe(
	v.string(),
	v.transform(normalizeHost),
	v.regex(/^[a-z0-9.-]+$/, 'host must be a bare hostname (no scheme, port or path)')
);

const SiteConfigSchema = v.object({
	hosts: v.optional(v.array(HostSchema)),
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
	),
	v.check(
		(sites) =>
			Object.entries(sites).every(([id, site]) => id === DEFAULT_SITE_ID || site.hosts?.length),
		`every site except "${DEFAULT_SITE_ID}" must have at least one host`
	),
	v.check((sites) => {
		const hosts = Object.values(sites).flatMap((site) => site.hosts ?? []);
		return new Set(hosts).size === hosts.length;
	}, 'a host may only belong to one site')
);

export interface SiteConfig extends v.InferOutput<typeof SiteConfigSchema> {
	id: string;
}

/**
 * Parses SITES into a map of site id -> config. A request is served by the site whose hosts
 * include the request host; the "default" entry (the main site) is used for any host that doesn't
 * match, and is always present in the result.
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
			'JSON object mapping site id ("default" for the main site) to site config, e.g. {"default":{"matomoId":1},"suecia":{"hosts":["suecia.libris.kb.se"],"searchSite":"https://suecia.kb.se/","matomoId":12}}'
	},
	PUBLIC_FJARRLAN_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_MATOMO_URL: { public: true, schema: (input) => input ?? '' },
	PUBLIC_DEBUG_SUPERSEARCH: {
		public: true,
		schema: (input) => input ?? '',
		description: 'Log supersearch operations in the console'
	}
});
