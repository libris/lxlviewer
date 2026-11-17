import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

// http(s) and protocol-relative (//) URLs are external; relative paths,
// fragments and other schemes (mailto:, tel:) are left as they are.
function isExternal(href: string) {
	return /^(https?:)?\/\//i.test(href.trim());
}

const opts: sanitizeHtml.IOptions = {
	allowedAttributes: {
		a: ['href', 'target', 'rel', 'class', 'title']
	},
	transformTags: {
		a: (tagName, attribs) => {
			const href = attribs.href || '';

			if (!isExternal(href)) {
				return { tagName: 'a', attribs: { ...attribs, href } };
			}

			return {
				tagName: 'a',
				attribs: {
					...attribs,
					target: '_blank',
					rel: 'noopener noreferrer',
					class: 'ext-link',
					href
				}
			};
		}
	}
};

export function markdownToHtml(md: string) {
	const html = marked.parse(md, { async: false, gfm: true, breaks: true });
	return sanitizeHtml(html, opts);
}
