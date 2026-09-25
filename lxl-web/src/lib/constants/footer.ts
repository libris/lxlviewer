import { env } from '$env/dynamic/public';
import { FOOTER_COOKIES_HREF, type FooterSection } from '$lib/types/site';

export const defaultFooter: FooterSection[] = [
	{
		id: 'nav-info',
		titleKey: 'footer.information',
		items: [
			{
				titleKey: 'footer.about',
				href: '/about'
			},
			{
				titleKey: 'footer.faq',
				href: 'https://www.kb.se/samverkan-och-utveckling/libris/fragor-och-svar-om-libris-nya-soktjanst.html'
			},
			{ titleKey: 'footer.cookies', href: FOOTER_COOKIES_HREF },
			{
				titleKey: 'footer.gdpr',
				href: 'https://www.kb.se/om-oss/hantering-av-personuppgifter#Librissok'
			},
			{
				titleKey: 'appMenu.accessibilityStatement',
				href: 'https://www.kb.se/om-oss/tillganglighet-pa-kbs-webbplatser-och-digitala-tjanster.html#item_125b5507eb18cedffd1a436125_45b5507eb18cedffd1a4317ec'
			}
		]
	},
	{
		id: 'nav-shortcuts',
		titleKey: 'footer.shortcuts',
		items: [
			{ titleKey: 'appMenu.help', href: '/help/search' },
			{ titleKey: 'appMenu.illSite', href: env.PUBLIC_FJARRLAN_URL }
		]
	},
	{
		id: 'nav-contact',
		titleKey: 'footer.contact',
		items: [
			{
				titleKey: 'footer.customerSupport',
				href: 'https://www.kb.se/om-oss/kontakta-oss#item_125b5507eb18cedffd1a43f869_45b5507eb18cedffd1a4321f3'
			}
		]
	}
];
