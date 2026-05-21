import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const opts: sanitizeHtml.IOptions = {
	allowedAttributes: {
		a: ['href', 'target', 'rel', 'class', 'title']
	},
	transformTags: {
		a: (tagName, attribs) => {
			const href = attribs.href || '';

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
