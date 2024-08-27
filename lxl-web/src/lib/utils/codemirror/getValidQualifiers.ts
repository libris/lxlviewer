import type { Qualifier } from '$lib/types/qualifier';

function getValidQualifiers(
	allQualifiers: Qualifier[],
	usedQualifiers: { name: string; value?: string; range: { from: number; to: number } }[]
) {
	const { valid, invalid } = usedQualifiers.reduce(
		(acc, usedQualifierItem) => {
			if (allQualifiers.find((qualifierItem) => qualifierItem.name === usedQualifierItem.name)) {
				return {
					...acc,
					valid: [...new Set([...acc.valid, usedQualifierItem])]
				};
			}
			return {
				...acc,
				invalid: [...new Set([...acc.invalid, usedQualifierItem])]
			};
		},
		{ valid: [], invalid: [] }
	);

	return { valid: valid.length ? valid : undefined, invalid: invalid.length ? invalid : undefined };
}

export default getValidQualifiers;
