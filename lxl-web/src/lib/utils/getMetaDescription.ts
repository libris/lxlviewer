import { toString } from '$lib/utils/xl';
import type { DisplayDecorated } from '$lib/types/xl';

const META_DESCRIPTION_MAX_LENGTH = 155;

export function getMetaDescription(
	data: DisplayDecorated | string | undefined,
	maxLength = META_DESCRIPTION_MAX_LENGTH
): string {
	if (!data) {
		return '';
	}

	let text = '';

	if (typeof data === 'string') {
		text = data;
	} else {
		text = toString(data);
	}

	text = text.replace(/\s+/g, ' ').trim();

	if (!text) {
		return '';
	}

	if (text.length <= maxLength) {
		return text;
	}

	const truncated = text.substring(0, maxLength);
	const lastSpace = truncated.lastIndexOf(' ');

	if (lastSpace > 0) {
		return truncated.substring(0, lastSpace).trim() + '…';
	}

	return truncated.trim() + '…';
}

export default getMetaDescription;
