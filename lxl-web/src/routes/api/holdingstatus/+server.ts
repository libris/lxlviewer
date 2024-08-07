import { env } from '$env/dynamic/private';

export async function GET({ url }) {
	const res = await fetch(`${env.HOLDING_STATUS_URL}?${url.searchParams.toString()}&output=json`);
	return res;
}
