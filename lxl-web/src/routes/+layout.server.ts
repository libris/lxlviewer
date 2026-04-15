export async function load({ locals, url }) {
	const userSettings = locals.userSettings;

	// create dependency to react to _r changes
	url.searchParams.get('_r');
	const subsetMapping = locals.subsetMapping;

	const siteName = locals.site?.name;
	const qualifierSuggestions = locals.qualifierSuggestions;

	return {
		userSettings,
		subsetMapping,
		siteName,
		qualifierSuggestions
	};
}
