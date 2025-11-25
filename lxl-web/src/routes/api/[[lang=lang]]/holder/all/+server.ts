import { getAllLibraries } from '$lib/utils/getLibraries';
import { json } from '@sveltejs/kit';

export async function GET() {
	const libs = getAllLibraries();
	return json(libs);
}
