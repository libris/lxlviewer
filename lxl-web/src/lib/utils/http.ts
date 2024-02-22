export function relativize(uri: string) {
	return uri.split('/').slice(3).join('');
}

/**
 * Turns /find?q=etc into find?q=etc to keep lang support (base href)
 * @param path A relative path
 */
export function removeOpeningSlash(path: string | undefined) {
	if (path && path.charAt(0) === '/') {
		return path.replace('/', '');
	}
	return path;
}
