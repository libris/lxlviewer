import { USE_LOCALHOST_API } from '$env/static/private';
import { PUBLIC_API_PATH } from '$env/static/public';
import type { HandleFetch } from '@sveltejs/kit';

/*
This function allows you to modify (or replace) a fetch request that happens inside a load or action function that runs on the server (or during pre-rendering).
*/

export const handleFetch: HandleFetch = async ({ request, fetch }) => {
	if (USE_LOCALHOST_API === 'true' && request.url.startsWith(PUBLIC_API_PATH)) {
		// Hit API directly bypassing whatever proxies and load balancers sit between it and the public internet).
		// clone the original request, but change the URL
		request = new Request(request.url.replace(PUBLIC_API_PATH, 'http://localhost:9999/'), request);
	}

	return fetch(request);
};
