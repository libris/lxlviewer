import { env } from '$env/dynamic/private';
import { getSupportedLocale } from '$lib/i18n/locales';
import { cslFromMainEntity, initCite } from '$lib/utils/citation';
import { error } from '@sveltejs/kit';

const supportedFormats = ['ris', 'bibtex', 'csl'];

// UNAPI - see v1 spec
// https://web.archive.org/web/20140331070802/http://unapi.info/specs/
export async function GET({ params, url, fetch }) {
	const lang = getSupportedLocale(params?.lang);
	const id = url.searchParams.get('id');
	const format = url.searchParams.get('format');

	if (id && format) {
		if (supportedFormats.some((f) => format.toLowerCase() === f)) {
			let url;
			if (id.startsWith(env.API_URL)) {
				// support both full URI:s and fnurgels
				url = id;
			} else {
				url = `${env.API_URL}/${id}`;
			}
			const res = await fetch(`${url}/data.jsonld?framed=true&computedLabel=${lang}`);
			if (res.ok) {
				const record = await res.json();
				const csl = cslFromMainEntity(record.mainEntity);
				const cite = await initCite();
				cite.add(csl);

				// return CSL-JSON
				if (format === 'csl') {
					const csl = cite.formatAs('csl') as string;
					return new Response(csl, {
						status: 300,
						headers: {
							'Content-Type': 'application/json;charset=utf-8'
						}
					});
				}

				// return RIS
				if (format === 'ris') {
					const ris = cite.formatAs('ris') as string;
					return new Response(ris, {
						status: 300,
						headers: {
							'Content-Type': 'text/plain;charset=UTF-8'
						}
					});
				}

				// TODO return bibtex
				if (format == 'bibtex') {
					const bibtex = cite.formatAs('bibtex') as string;
					return new Response(bibtex, {
						status: 300,
						headers: {
							'Content-Type': 'text/plain;charset=UTF-8'
						}
					});
				}
			} else if (res.status === 404) {
				// not found
				return error(404, 'Not found');
			} else {
				return error(500, 'An error occurred');
			}
		} else {
			// bad format
			return error(406, 'Bad format');
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
