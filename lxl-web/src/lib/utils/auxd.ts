import crypto from 'crypto';

export function getImageLink(mainEntity) {
	const firstInstance = getFirstInstanceOf(mainEntity);
	if ('image' in mainEntity) {
		// TODO: handle multiple images
		return mainEntity.image[0]['@id'];
	} else if (firstInstance && firstInstance.image) {
		return firstInstance.image[0]['@id'];
	} else {
		return '';
	}
}

function getFirstInstanceOf(mainEntity) {
	if (mainEntity['@reverse'] && mainEntity['@reverse']['instanceOf']) {
		return mainEntity['@reverse']['instanceOf'][0];
	} else {
		return undefined;
	}
}

export function calculateExpirationTime() {
	const startOfDay = new Date();
	startOfDay.setHours(0, 0, 0, 0);
	return Math.floor(startOfDay.valueOf() / 1000) + 3600 * 24 * 2; // start of day + 2 days
}

export function generateAuxdImageUri(expires, url, secret) {
	if (!url) {
		return '';
	}
	const parsedUrl = new URL(url);
	const key = generateImageHash(expires, parsedUrl.pathname, secret);
	// At the moment we need the URL origin to be http://auxd-prod.libris.kb.se instead of https://libris.kb.se/
	// otherwise we could just take parsed_url.origin here instead of auxdOrigin
	const auxdOrigin = `http://auxd-prod.libris.kb.se`;
	return `${auxdOrigin}${parsedUrl.pathname}?key=${key}&expires=${expires}`;
}

function generateImageHash(expires, url, secret) {
	const input = `${expires} ${url} ${secret}`;
	const binaryHash = crypto.createHash('md5').update(input).digest();
	const base64Value = Buffer.from(binaryHash).toString('base64');
	return base64Value.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
