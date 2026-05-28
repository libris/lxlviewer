import { describe, expect, it } from 'vitest';
import { isOldEnough, YEARS_OLD_ENOUGH } from '$lib/utils/getEodAvailable.server';

describe('eodAvailable', () => {
	it('handles publication year', () => {
		const cases: [string, number, boolean][] = [
			['1930', 1929 + YEARS_OLD_ENOUGH, false],
			['1930', 1930 + YEARS_OLD_ENOUGH, true],
			['1930', 1931 + YEARS_OLD_ENOUGH, true],

			['193', 1930 + YEARS_OLD_ENOUGH, false],
			['abc', 2026, false]
		];

		for (const c of cases) {
			const [publicationYear, currentYear, result] = c;
			expect(isOldEnough(publicationYear, currentYear), `${c}`).toStrictEqual(result);
			const bracketed = `[${publicationYear}]`;
			expect(isOldEnough(bracketed, currentYear), `${bracketed} ${c}`).toStrictEqual(result);
		}
	});

	it('handles uncertain publication year', () => {
		const cases: [string, number, boolean][] = [
			['193¤', 1920 + YEARS_OLD_ENOUGH, false],
			['193¤', 1929 + YEARS_OLD_ENOUGH, false],
			['193¤', 1930 + YEARS_OLD_ENOUGH, false],
			['193¤', 1939 + YEARS_OLD_ENOUGH, false],
			['193¤', 1940 + YEARS_OLD_ENOUGH, true],

			['17¤¤', 1799 + YEARS_OLD_ENOUGH, false],
			['17¤¤', 1800 + YEARS_OLD_ENOUGH, true],

			['18¤¤', 1899 + YEARS_OLD_ENOUGH, false],
			['18¤¤', 1900 + YEARS_OLD_ENOUGH, true],
			['18¤¤', 1915 + YEARS_OLD_ENOUGH, true],
			['18¤¤', 2000 + YEARS_OLD_ENOUGH, true],

			['19¤¤', 1999 + YEARS_OLD_ENOUGH, false],
			['19¤¤', 2000 + YEARS_OLD_ENOUGH, true]
		];

		for (const c of cases) {
			const [publicationYear, currentYear, result] = c;
			for (const char of ['?', 'u', 'n', 'x', 'X']) {
				const uncertainYear = publicationYear.replaceAll('¤', char);
				expect(isOldEnough(uncertainYear, currentYear), `${c}`).toStrictEqual(result);
				const bracketed = `[${uncertainYear}]`;
				expect(isOldEnough(bracketed, currentYear), `${bracketed} ${c}`).toStrictEqual(result);
			}
		}
	});
});
