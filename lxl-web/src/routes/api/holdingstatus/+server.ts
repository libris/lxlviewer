import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { HoldingStatus } from '$lib/types/api';

export async function GET({ url }) {
	const res = await fetch(`${env.HOLDING_STATUS_URL}?${url.searchParams.toString()}&output=json`);
	const data = (await res.json()) as HoldingStatus;

	return json(data);
}
