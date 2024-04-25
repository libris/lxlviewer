/**
 * Adds title separator and suffix to title string
 *
 * Future: the suffix should be set in the site config
 */

function getPageTitle(title?: string) {
	if (title) {
		return `${title} | Libris`;
	}
	return 'Libris';
}

export default getPageTitle;
