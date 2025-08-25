import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales';
import { citeFromMainEntity } from '$lib/utils/citations';

const supportedFormats = ['ris', 'bibtex', 'csl'];

// UNAPI - see v1 spec
// https://web.archive.org/web/20140331070802/http://unapi.info/specs/
export async function GET({ params, url, fetch }) {
	const lang = getSupportedLocale(params?.lang);
	const id = url.searchParams.get('id');
	const format = url.searchParams.get('format');

	if (id && format) {
		if (supportedFormats.some((f) => format.toLowerCase() === f)) {
			const res = await fetch(`${env.API_URL}/${id}/data.jsonld?framed=true&computedLabel=${lang}`);
			if (res.ok) {
				const record = await res.json();
				const cite = citeFromMainEntity(record.mainEntity);

				// return CSL-JSON
				if (format === 'csl') {
					const csl = cite.get({ style: 'csl', type: 'json', format: 'string' });
					return new Response(csl, {
						status: 300,
						headers: {
							'Content-Type': 'application/json;charset=utf-8'
						}
					});
				}

				// return RIS
				if (format === 'ris') {
					const ris = cite.get({ style: 'ris', type: 'string', format: 'real' });
					return new Response(ris, {
						status: 300,
						headers: {
							'Content-Type': 'text/plain;charset=UTF-8'
						}
					});
				}

				// TODO return bibtex
				if (format == 'bibtex') {
					const bibtex = cite.get({ style: 'bibtex', type: 'string', format: 'real' });
					return new Response(bibtex, {
						status: 300,
						headers: {
							'Content-Type': 'text/plain;charset=UTF-8'
						}
					});
				}
			} else if (res.status === 404) {
				// not found
				return new Response('Not Found', { status: 404 });
			} else {
				return new Response('Error', { status: 500 });
			}
		} else {
			// bad format
			return new Response('Bad format', { status: 406 });
		}
	} else {
		// XML response when missing id or format param
		const formats = id ? `<formats id='${id}'>` : '<formats>';

		const xml = `<?xml version='1.0' encoding='UTF-8'?>
        ${formats}
        <format name='bibtex' type='text/plain' />
        <format name='ris' type='text/plain' />
        <format name='csl' type='application/json' />
      </formats>`;

		return new Response(xml, {
			headers: {
				'Content-Type': 'application/xml;charset=UTF-8'
			}
		});
	}
}
