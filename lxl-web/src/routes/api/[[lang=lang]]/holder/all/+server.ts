import { getAllLibraries } from '$lib/utils/getLibraries.server';
import { json } from '@sveltejs/kit';

// unused atm
export async function GET() {
	const libs = getAllLibraries();
	const libsArr = Array.from(libs.values());
	return json(libsArr);
}
