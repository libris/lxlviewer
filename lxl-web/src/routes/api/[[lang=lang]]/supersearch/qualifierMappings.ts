// export const QUALIFIER_KEY_FROM_ALIAS = {
// 	Contributor: ['medverkande'],
// 	Language: ['språk'],
// 	Subject: ['ämne'],
// 	Bibliography: ['bibliografi']
// };

// export const BASE_CLASS_FROM_QUALIFIER_KEY = {
// 	Agent: ['contributor', 'subject'],
// 	Subject: ['subject'],
// 	GenreForm: ['genreForm'],
// 	Language: ['language', 'translationOf.language'],
// 	Library: ['itemHeldBy'],
// 	Bibliography: ['bibliography']
// };

// export function findInMap(map: Record<string, string[]>, k: string) {
// 	const found = [];
// 	if (k && typeof k === 'string') {
// 		for (const [key, value] of Object.entries(map)) {
// 			if (Array.isArray(value) && value.some((el) => el.toLowerCase() === k.toLowerCase())) {
// 				found.push(key);
// 			}
// 		}
// 	}
// 	return found;
// }
