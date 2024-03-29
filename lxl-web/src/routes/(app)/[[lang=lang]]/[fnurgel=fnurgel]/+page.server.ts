import { env } from '$env/dynamic/private';
import { type DisplayDecorated, DisplayUtil, type FramedData, pickProperty } from '$lib/utils/xl';
import { getSupportedLocale } from '$lib/i18n/locales';
import { LxlLens } from '$lib/utils/display.types';
import jmespath from 'jmespath';

export interface ResourcePage {
	header: DisplayDecorated;
	overview: DisplayDecorated;
	details: DisplayDecorated;
}

export const load = async ({ params, locals, fetch }) => {
	const displayUtil: DisplayUtil = locals.display;
	//const vocabUtil: VocabUtil = locals.vocab;

	const locale = getSupportedLocale(params?.lang);

	const resourceRes = await fetch(`${env.API_URL}/${params.fnurgel}?framed=true`, {
		headers: { Accept: 'application/ld+json' }
	});
	const resource = await resourceRes.json();
	const mainEntity = centerOnWork(resource['mainEntity'] as FramedData);

	// TODO this doesn't really play well with alternativeProperties...?
	// say we want to use alternativeProperties for hasTitle in the heading
	// "alternateProperties": [
	//	 {"subPropertyOf": "hasTitle", "range": "KeyTitle"},
	//	 {"subPropertyOf": "hasTitle", "range": "Title"},
	// 	 "hasTitle"
	// ]
	// we then probably want all titles in the overview
	// but we don't want them there when there is only one title?
	// or just place "hasTitle" (without alternateProperties) in details?

	const overview = displayUtil.lensAndFormat(mainEntity, LxlLens.PageOverView, locale);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, overviewWithoutHasInstance] = pickProperty(overview, ['hasInstance']);

	// TODO: Replace with a custom getProperty method (similar to pickProperty)
	const instances = jmespath.search(overview, '*[].hasInstance[]');

	return {
		heading: displayUtil.lensAndFormat(mainEntity, LxlLens.PageHeading, locale),
		overview: overviewWithoutHasInstance,
		details: displayUtil.lensAndFormat(mainEntity, LxlLens.PageDetails, locale),
		instances,
		full: overview
	};
};

// TODO: handle titles correctly
function centerOnWork(mainEntity: FramedData): FramedData {
	if ('instanceOf' in mainEntity) {
		const result = mainEntity.instanceOf;
		delete mainEntity.instanceOf;
		result['@reverse'] = { instanceOf: [mainEntity] };
		if (!result.hasTitle && mainEntity.hasTitle) {
			result.hasTitle = mainEntity.hasTitle;
		}
		return result;
	} else {
		return mainEntity;
	}
}
