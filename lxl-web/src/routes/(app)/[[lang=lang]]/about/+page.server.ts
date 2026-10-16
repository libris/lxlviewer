import { defaultLocale, getSupportedLocale } from '#lib/i18n/locales.js';
import { markdownToHtml } from '#lib/utils/htmlFromMarkdown.server.js';

export const load = ({ params, locals }) => {
	const locale = getSupportedLocale(params?.lang);
	const siteAbout = locals.site?.configuration?.articles?.about?.articleBodyByLang;
	const siteAboutMd = siteAbout?.[locale] ?? siteAbout?.[defaultLocale];

	return {
		locale,
		overrideAboutHtml: siteAboutMd ? markdownToHtml(siteAboutMd) : null
	};
};
