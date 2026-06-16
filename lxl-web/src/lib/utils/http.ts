/**
 * Turns an absolute url into a relative one
 * @param path - absolute or relative url
 */
export function relativizeUrl(url: string | undefined) {
	if (!url) {
		return url;
	}
	if (url.charAt(0) === '/') {
		return url;
	}
	return '/' + url.split('/').slice(3).join('');
}

/**
 * returns everything before the path of the url
 * https://example.com/xyz/... -> https://example.com
 * @param url url with scheme and authority
 */
export function getBaseUrl(url: string | undefined | null): string | undefined {
	if (!url) {
		return undefined;
	}

	const ix1 = url.indexOf('://');

	if (ix1 === -1) {
		return undefined;
	}

	const afterProtocol = ix1 + 3;
	if (afterProtocol === url.length) {
		return undefined;
	}

	const ix2 = url.indexOf('/', afterProtocol);

	if (ix2 === -1) {
		return url;
	}

	return url.slice(0, ix2);
}

export function stripAnchor(url: string | undefined) {
	if (!url) {
		return url;
	}
	return url.split('#')[0];
}

export function trimSlashes(url: string | undefined) {
	return url?.replace(/^\/|\/$/g, '');
}

export function getUriSlug(url: string | undefined) {
	if (!url) {
		return '';
	}
	const urlArray = new URL(url).pathname.split('/');
	return urlArray.includes('term')
		? urlArray.slice(urlArray.indexOf('term') + 1).join('/')
		: urlArray.pop();
}
