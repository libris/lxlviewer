import { type DerivedLensTypeDefinition, LensType } from '$lib/types/xl';

export enum LxlLens {
	PageHeading = 'page-heading',
	PageOverView = 'page-overview',
	PageDetails = 'page-details',
	CardHeading = 'card-heading',
	CardBody = 'card-body'
}

export const DERIVED_LENSES: DerivedLensTypeDefinition[] = [
	{
		name: LxlLens.PageHeading,
		base: [LensType.WebChip, LensType.Chip],
		minusFirst: [],
		minusAll: []
	},
	{
		name: LxlLens.PageOverView,
		base: [LensType.Card],
		minusFirst: [LensType.WebChip, LensType.Chip],
		minusAll: []
	},
	{
		name: LxlLens.PageDetails,
		base: [LensType.Full],
		minusFirst: [LensType.WebChip, LensType.Chip],
		minusAll: [LensType.Card]
	},
	{
		name: LxlLens.CardHeading,
		base: [LensType.WebChip, LensType.Chip],
		minusFirst: [],
		minusAll: []
	},
	{
		name: LxlLens.CardBody,
		base: [LensType.WebCard, LensType.Card],
		minusFirst: [LensType.WebChip, LensType.Chip],
		minusAll: [LensType.WebCardHeaderExtra, LensType.WebCardFooter]
	}
];
