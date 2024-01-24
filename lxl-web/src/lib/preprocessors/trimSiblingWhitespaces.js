import { parse, walk } from 'svelte/compiler';
import MagicString from 'magic-string';

/**
 * @param {object} options
 * @param {string[]} options.filenames
 */
const trimSiblingWhitespaces = ({ filenames }) => ({
	name: 'trim-sibling-whitespaces',
	/**
	 * @param {object} options
	 * @param {string} options.content
	 * @param {string} options.filename
	 */
	markup: ({ content, filename }) => {
		const fileToBePreprocessed = filenames.find((name) => filename.endsWith(name));

		if (fileToBePreprocessed) {
			const s = new MagicString(content);

			let start;
			let end;

			const { html } = parse(content, { filename });
			walk(html, {
				enter(node) {
					if (!start) {
						start = node.start;
					}
					if (!end || node.end > end) {
						end = node.end;
					}
				}
			});

			if (start && end) {
				s.update(start, end, s.slice(start, end).replace(/^\t*|\n/gm, ''));
			}

			if (s.hasChanged()) {
				console.log(
					`\nTrimmed sibling whitespaces in ${fileToBePreprocessed} using trim-sibling-whitespaces preprocessor\nSee: https://github.com/sveltejs/svelte/issues/189`
				);
			}
			return {
				code: s.toString(),
				map: s.generateMap({ source: filename })
			};
		}
	}
});

export default trimSiblingWhitespaces;
