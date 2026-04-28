import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function markdownToHtml(md: string) {
	const html = marked.parse(md, { async: false, gfm: true, breaks: true });
	return sanitizeHtml(html);
}
