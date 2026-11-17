import { defaultLocale, getSupportedLocale } from '#lib/i18n/locales.js';
import { markdownToHtml } from '#lib/utils/htmlFromMarkdown.server.js';

export const load = ({ params, locals }) => {
	const locale = getSupportedLocale(params?.lang);
	const siteHelp = locals.site?.configuration?.articles?.help?.articleBodyByLang;
	const siteHelpMd = siteHelp?.[locale] ?? siteHelp?.[defaultLocale];

	return {
		locale,
		overrideHelpHtml: siteHelpMd ? markdownToHtml(siteHelpMd) : null
	};
};
