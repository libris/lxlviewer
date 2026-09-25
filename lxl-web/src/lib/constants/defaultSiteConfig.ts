import { env } from '$env/dynamic/public';
import defaultSiteConfigJson from '$lib/assets/json/defaultSiteConfig.json';
import type {
	AppMenuItem,
	FeaturedCategoryConfig,
	FeaturedSearchConfig,
	Features,
	FooterSection,
	Site
} from '$lib/types/site';

interface DefaultSiteConfiguration extends NonNullable<Site['configuration']> {
	themeName: string;
	favicon: string;
	features: Features;
	footer: FooterSection[];
	appMenu: AppMenuItem[];
	featuredSearches: FeaturedSearchConfig[];
	featuredSearches2: FeaturedSearchConfig[];
	featuredCategories: FeaturedCategoryConfig[];
}

export const defaultSiteConfiguration: DefaultSiteConfiguration = JSON.parse(
	JSON.stringify(defaultSiteConfigJson).replaceAll(
		'${PUBLIC_FJARRLAN_URL}',
		env.PUBLIC_FJARRLAN_URL ?? ''
	)
).lxlwebConfiguration;

export function resolveFeatures(overrides?: Partial<Features>): Features {
	return { ...defaultSiteConfiguration.features, ...overrides };
}
