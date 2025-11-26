import { expect, test } from '@playwright/test';
import { Locales, baseLocale, type LocaleCode } from '$lib/i18n/locales';

const ROUTES_TO_CHECK = [
	'/',
	'/find?_q=a&_limit=20',
	'/h08ndxddfg5v2pjf',
	'/help',
	'/about',
	'/my-pages'
];

ROUTES_TO_CHECK.forEach((route) => {
	test(`route: ${route}`, async ({ page }) => {
		await page.goto(route);
		const routeSlug = route.match(/^\/([A-Za-z0-9-]+)/)?.[1] || '';
		const allLinks = await page
			.getByRole('link')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
		const linksWithDifferentLocale = getLinksWithDifferentLocale(allLinks, 'sv', route);
		await expect(
			linksWithDifferentLocale,
			'includes no links to different locales (except for locale swticher)'
		).toHaveLength(1);

		await page.getByRole('link').getByText('In English').click();

		await expect(page).toHaveURL(routeSlug ? `en${route}` : 'en');
		const allLinksAfter = await page
			.getByRole('link')
			.evaluateAll((links) => links.map((link) => link.getAttribute('href')!));
		const linksWithDifferentLocaleAfter = getLinksWithDifferentLocale(allLinksAfter, 'en', route);
		await expect(
			linksWithDifferentLocaleAfter,
			`still includes no links to different locales after switching locale (except for locale swticher)`
		).toHaveLength(1);
	});
});

function getLinksWithDifferentLocale(allLinks: string[], currentLocale: LocaleCode, route: string) {
	const otherLocale = Object.keys(Locales).find((locale) => locale !== currentLocale);
	const relativeLinks = allLinks.filter((link) => link.startsWith('/'));
	const linksWithLocale = relativeLinks.filter((link) => {
		if (currentLocale === baseLocale) {
			return !link.startsWith(`/${otherLocale}${route === '/' ? '' : '/'}`);
		}
		return link.startsWith(`/${currentLocale}`);
	});
	const linksWithDifferentLocale = relativeLinks.filter((link) => !linksWithLocale.includes(link));

	return linksWithDifferentLocale;
}
