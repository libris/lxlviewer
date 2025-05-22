import type { FullHolderBySigel } from '$lib/types/holdings';

type Cache = {
	holders: FullHolderBySigel;
};
export const holdersCache: Cache = $state({ holders: {} });
