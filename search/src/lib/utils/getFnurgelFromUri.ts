/**
 * Gets the Fnurgel from an Libris URI
 */
function getFnurgelFromUri(id: string) {
	const uriParts = id.split('/');
	return uriParts[uriParts.length - 1].replaceAll('#it', '');
}

export default getFnurgelFromUri;
