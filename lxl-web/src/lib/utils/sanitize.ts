import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function sanitize(html: string): string {
	return sanitizeHtml(html);
}

export function renderMarkdown(md: string) {
	const html = marked.parse(md, { async: false, gfm: true, breaks: true });
	return sanitize(html);
	// return html;
	// return md;
}
