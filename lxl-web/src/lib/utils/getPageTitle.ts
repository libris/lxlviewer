/**
 * Adds title separator and suffix to title string
 */
function getPageTitle(title?: string) {
	if (title) {
		return `${title} | Libris`;
	}
	return 'Libris';
}

export default getPageTitle;
