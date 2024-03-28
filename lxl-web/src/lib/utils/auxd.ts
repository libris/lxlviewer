import crypto from 'crypto';

export function getImageLinks(mainEntity) {
	const instances = getInstances(mainEntity);
	if ('image' in mainEntity) {
		return [
			{
				recordId: mainEntity['@id'],
				imageLink: mainEntity.image[0]['@id']
			}
		];
	} else if (instances?.length) {
		const imageLinks = instances.map((i) => {
			if (i.image) {
				return {
					recordId: i['@id'],
					imageLink: i.image[0]['@id']
				};
			} else {
				return {
					recordId: i['@id'],
					imageLink: ''
				};
			}
		});
		return imageLinks;
	} else {
		return [];
	}
}

export function getFirstImageLink(mainEntity) {
	const links = getImageLinks(mainEntity);
	return links.length ? links[0].imageLink : '';
}

function getInstances(mainEntity) {
	if (mainEntity['@reverse'] && mainEntity['@reverse']['instanceOf']) {
		return mainEntity['@reverse']['instanceOf'];
	} else {
		return [];
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
