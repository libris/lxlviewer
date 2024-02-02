import { type DerivedLensTypeDefinition, LensType } from '$lib/utils/xl';

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
		minus: []
	},
	{
		name: LxlLens.PageOverView,
		base: [LensType.Card],
		minus: [LensType.WebChip, LensType.Chip]
	},
	{
		name: LxlLens.PageDetails,
		base: [LensType.Full],
		minus: [LensType.WebChip, LensType.Chip, LensType.Card]
	},
	{
		name: LxlLens.CardHeading,
		base: [LensType.WebChip, LensType.Chip],
		minus: []
	},
	{
		name: LxlLens.CardBody,
		base: [LensType.Card],
		minus: [LensType.WebChip, LensType.Chip]
	}
];
