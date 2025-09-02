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
	const urlArray = new URL(url).pathname.split('/');
	return urlArray.includes('term')
		? urlArray.slice(urlArray.indexOf('term') + 1).join('/')
		: urlArray.pop();
}
