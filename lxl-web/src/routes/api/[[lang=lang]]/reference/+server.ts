import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { getSupportedLocale } from '$lib/i18n/locales';

// TODO proper error handling
export async function GET({ params, url }) {
	const fnurgel = url.searchParams.get('id');
	if (fnurgel) {
		const lang = getSupportedLocale(params?.lang);
		const recordRes = await fetch(`${env.API_URL}/${fnurgel}?framed=true&computedlabels=${lang}`, {
			headers: { Accept: 'application/ld+json' }
		});
		try {
			const record = await recordRes.json();
			return json(record);
		} catch (error) {
			return json(error);
		}
	}
	return json(null);
}
