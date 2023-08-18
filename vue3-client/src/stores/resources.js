import { defineStore } from "pinia";
import { useUserStore } from "./user";

export const useResourcesStore = defineStore('resources', {
	state: () => ({
		resourcesLoaded: false,
		loadingError: false,
		vocab: {},
		display: {},
		context: {},
		templates: {},
		helpDocs: null,
		globalMessages: null,
		i18n: null,
		displayGroups: null,
	}),
	getters: {
		// Drop in replacement for Vuex state that returns the entire state object. Do NOT use in new components!!
		// Bad practice. Use hook (useResourcesStore) or map all properties using mapState instead
		resources: (state) => state,
		templates: (state) => state.templates,
		activeGlobalMessages: (state) => {
			const now = new Date();
			const activeMessages = [];
			const messages = state.globalMessages;
			const userStorage = useUserStore().userStorage;

			if (messages && messages.length > 0) {
				for (let i = 0; i < messages.length; i++) {
					if (userStorage.hasOwnProperty('dismissedMessages') && userStorage.dismissedMessages.includes(messages[i].id)) {
						continue;
					}

					const startTime = new Date(messages[i].startTime * 1000);
					const endTime = new Date(messages[i].endTime * 1000);

					if (startTime < now && endTime > now) {
						activeMessages.push(messages[i]);
					}
				}
			}

			return activeMessages;
		},
	},
});
