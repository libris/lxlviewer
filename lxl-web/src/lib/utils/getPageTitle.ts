import { TITLE_SEPARATOR, TITLE_SUFFIX, TITLE_MAX_LENGTH } from '$lib/constants/pageTitle';

/**
 * Adds title separator and suffix to title string
 *
 * Future: the constants should be set in a site config file / environment variables
 */

function getPageTitle(title?: string) {
	if (title) {
		const separatorAndSuffix = TITLE_SEPARATOR + TITLE_SUFFIX;

		// Truncate the title and add an ellipsis if the total length is greater than the max length
		if (title.length > TITLE_MAX_LENGTH - separatorAndSuffix.length) {
			return `${title.substring(0, TITLE_MAX_LENGTH - separatorAndSuffix.length - 1) + '…'}${separatorAndSuffix}`;
		}

		return `${title}${separatorAndSuffix}`;
	}
	return TITLE_SUFFIX;
}

export default getPageTitle;
