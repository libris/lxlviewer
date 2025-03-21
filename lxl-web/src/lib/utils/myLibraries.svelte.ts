// import { JsonLd } from "$lib/types/xl";
// // import { saveUserSetting, userState } from "./userSettings.svelte";
// import type { LibraryItem } from "$lib/types/userSettings";

// // const settings = $derived(userState.settings);

// export function addLibrary(library: LibraryItem): void {
// 	if (library) {
// 		if (!userState.settings?.myLibraries) {
// 			userState.settings.myLibraries = {};
// 		}
// 		const myLibraries = userState.settings?.myLibraries;
// 		myLibraries[library[JsonLd.ID]] = library;
// 		myLibraries[library[JsonLd.ID] + 'h'] = library;
// 		console.log('add mylibraries', myLibraries)
// 		saveToCookie();
// 	} else {
// 		console.warn('did not add anything');
// 	}
// }

// export function removeLibrary(library: LibraryItem) {
// 	if (library && userState.settings?.myLibraries?.[library[JsonLd.ID]]) {
// 		userState.settings.myLibraries = {};
// 		// myLibraries = myLibraries?.filter(l => l[JsonLd.ID] !== library[JsonLd.ID]);
// 		// favLibraries = filteredLibraries;
// 		saveToCookie();
// 	} else {
// 		console.warn('did not remove anything')
// 	}
// }

// function saveToCookie() {
// 	console.log('save', userState.settings?.myLibraries)
// 	saveUserSetting('myLibraries', userState.settings?.myLibraries);
// }