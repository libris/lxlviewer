import { getSupportedLocale } from '$lib/i18n/locales';
import { getAllLibraries } from '$lib/utils/getLibraries.server';
import { json } from '@sveltejs/kit';

// unused atm
export async function GET({ params, locals }) {
	const locale = getSupportedLocale(params.lang);
	const libs = getAllLibraries(locals.display, locale);
	const libsArr = Array.from(libs.values());
	return json(libsArr);
}
