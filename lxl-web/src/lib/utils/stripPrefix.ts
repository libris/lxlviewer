export function stripPrefix<T extends string | undefined>(s: T, prefix: string): T {
	if (!s) {
		return s;
	}

	return s.startsWith(prefix) ? (s.slice(prefix.length) as T) : s;
}
