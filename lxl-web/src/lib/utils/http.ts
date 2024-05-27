/**
 * Turns an absolute url into a relative one
 * & formats it (removes the opening slash for base href)
 * @param path - absolute or relative url
 */
export function relativizeUrl(url: string | undefined) {
	if (!url) {
		return url;
	}
	if (url.charAt(0) === '/') {
		return url.replace('/', '');
	}
	return url.split('/').slice(3).join('');
}

export function stripAnchor(url: string | undefined) {
	if (!url) {
		return url;
	}
	return url.split('#')[0];
}

export function getUriSlug(url: string | undefined) {
	if (!url) {
		return '';
	}
	return new URL(url).pathname.split('/').pop();
}
