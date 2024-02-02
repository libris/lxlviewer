export function relativize(uri: string) {
	return uri.split('/').slice(3).join('');
}
