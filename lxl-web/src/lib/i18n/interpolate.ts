const placeholder = /{(.*?)}/g;

export function interpolate(template: string, values?: Record<string, string>) {
	if (!values) {
		return template;
	}
	return template.replace(placeholder, (match, key) => values[key] || match);
}
