import type { FullHolderBySigel } from '$lib/types/holdings';

type Cache = {
	holders: undefined | FullHolderBySigel;
};
export const holdersCache: Cache = $state({ holders: undefined });
