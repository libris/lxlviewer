import { defineStore } from "pinia";

export const useStatusStore = defineStore('status', {
	state: () => ({
		userIdle: false,
		panelOpen: false,
		fullScreenPanelOpen: false,
		keybindState: '',
		fullWidth: false,
		keyActions: [],
		resultList: {
			loading: false,
		},
		loadingIndicators: [],
		notifications: [],
		helpSectionTitle: '',
		remoteDatabases: [],
		workingRemoteDatabases: '',
		failedRemoteDatabases: '',
		hintSigelChange: false,
	}),
	actions: {
		pushNotification(content) {
			const date = new Date();
			content.id = StringUtil.getHash(`${date.getSeconds()}${date.getMilliseconds()}`);
			this.notifications.push(content);
		},
		removeNotification(id) {
			for (let i = 0; i < this.notifications.length; i++) {
				if (this.notifications[i].id === id) {
					this.notifications.splice(i, 1);
				}
			}
		},
		// TODO: Remove this action
		setStatusValue(payload) {
			console.log('payload', JSON.parse(JSON.stringify(payload)));
			if (this.hasOwnProperty(payload.property)) {
				this[payload.property] = payload.value;
			} else {
				throw new Error(`Trying to set unknown status property "${payload.property}". Is it defined in the store?`);
			}
		},
		pushLoadingIndicator(indicatorString) {
			const loaders = this.loadingIndicators;
			loaders.push(indicatorString);
			this.loadingIndicators = loaders;
		},
		removeLoadingIndicator(indicatorString) {
			const loaders = this.loadingIndicators;
			for (let i = 0; i < loaders.length; i++) {
				if (loaders[i] === indicatorString) {
					loaders.splice(i, 1);
					break;
				}
			}

			this.loadingIndicators = loaders;
		},
	},
});