import { cloneDeep } from 'lodash-es';
import { defineStore } from "pinia";
import * as User from '@/models/user';
import { useSettingsStore } from "./settings";
import { useResourcesStore } from "./resources";
import { cloneDeep } from 'lodash-es';
import * as StringUtil from 'lxljs/string';
import * as httpUtil from '@/utils/http';

export const useUserStore = defineStore('user', {
	state: () => ({
		user: User.getUserObject(),
		userDatabase: null,
		userStorage: {
			list: {},
			copyClipboard: null,
			dismissedMessages: [],
		},
	}),
	getters: {
		userFlagged: (state) => {
			const collection = [];
			if (state.userDatabase == null || state.userDatabase.markedDocuments == null) {
				return collection;
			}
			const list = state.userDatabase.markedDocuments;
			const ids = Object.keys(list);
			for (let i = 0; i < ids.length; i++) {
				const listItem = list[ids[i]];
				if (listItem.hasOwnProperty('tags') && listItem.tags.indexOf('Flagged') > -1) {
					collection.push({ '@id': ids[i], label: list[ids[i]].label });
				}
			}

			return collection;
		},
		userBookmarks: (state) => {
			const collection = [];
			if (state.userDatabase == null || state.userDatabase.markedDocuments == null) {
				return collection;
			}

			const list = state.userDatabase.markedDocuments;
			const ids = Object.keys(list);
			for (let i = 0; i < ids.length; i++) {
				const listItem = list[ids[i]];
				if (listItem.hasOwnProperty('tags') && listItem.tags.indexOf('Bookmark') > -1) {
					collection.push({ '@id': ids[i], label: list[ids[i]].label });
				}
			}

			return collection;
		},
	},
	actions: {
		setUser(userObj) {
			const settings = useSettingsStore();
			this.user = userObj;

			// Sync user language with app language
			settings.language = this.user.settings.language;

			// Sync user settings with localstorage
			this.user.saveSettings();
		},
		setUserStorage(data) {
			if (data) {
				this.userStorage = data;
			} else {
				this.userStorage = {
					list: {},
					copyClipboard: null,
				};
			}
		},
		logoutUser() {
			localStorage.removeItem('at');
			localStorage.removeItem('lastPath');
			this.user = User.getUserObject();
		},
		markDocument(payload) {
			const markedDocuments = cloneDeep(this.userDatabase.markedDocuments) || {};
			const tag = payload.tag;
			const id = payload.documentId;
			if (markedDocuments.hasOwnProperty(id)) {
				if (markedDocuments[id].tags.indexOf(tag) < 0) {
					markedDocuments[id].tags.push(tag);
				}
			} else {
				markedDocuments[id] = { tags: [tag] };
			}
			this.userDatabase.markedDocuments = markedDocuments;
		},
		unmarkDocument(payload) {
			const markedDocuments = cloneDeep(this.userDatabase.markedDocuments);
			const tag = payload.tag;
			const id = payload.documentId;
			if (markedDocuments.hasOwnProperty(id)) {
				if (markedDocuments[id].tags.indexOf(tag) >= 0) {
					markedDocuments[id].tags.splice(markedDocuments[id].tags.indexOf(tag), 1);
					if (markedDocuments[id].tags.length === 0) {
						delete markedDocuments[id];
					}
				}
			}
			this.userDatabase.markedDocuments = markedDocuments;
		},
		purgeUserTaggedDocuments(tagName) {
			const markedDocuments = cloneDeep(this.userDatabase.markedDocuments);
			const newList = {};
			for (const [key, value] of Object.entries(markedDocuments)) {
				value.tags.splice(value.tags.indexOf(tagName), 1);
				if (value.tags.length > 0) {
					newList[key] = value;
				}
			}
			this.userDatabase.markedDocuments = newList;
		},
		dismissMessage(id) {
			const userStorage = cloneDeep(this.userStorage);
			if (userStorage.hasOwnProperty('dismissedMessages') === false) {
				userStorage.dismissedMessages = [];
			}

			userStorage.dismissedMessages.push(id);
			this.userStorage = userStorage;
		},
		cleanupDismissedList() {
			const resources = useResourcesStore();
			if (resources.globalMessages.length > 0) {
				const userStorage = cloneDeep(this.userStorage);
				const keepInList = [];
				if (userStorage.hasOwnProperty('dismissedMessages') && userStorage.dismissedMessages.length > 0) {
					for (let i = 0; i < userStorage.dismissedMessages.length; i++) {
						const item = userStorage.dismissedMessages[i];
						for (let x = 0; x < resources.globalMessages.length; x++) {
							if (resources.globalMessages[x].id === item) {
								keepInList.push(item);
							}
						}
					}
				}
				userStorage.dismissedMessages = keepInList;
				this.userStorage = userStorage;
			}
		},
		async verifyUser() {
			return new Promise((resolve, reject) => {
				if (this.user.isLoggedIn === true && this.user.hasTokenExpired() === false) {
					resolve();
					return;
				}

				const settings = useSettingsStore();
				const token = localStorage.getItem('at');
				let userObj = User.getUserObject();
				if (token !== null) {
					const headers = new Headers();
					const verifyUrl = settings.verifyPath;
					headers.append('Authorization', `Bearer ${token}`);
					fetch(verifyUrl, {
						headers,
						method: 'GET',
					}).then(response => response.json()).then((result) => {
						userObj = User.getUserObject(result.user);
						userObj.token = token;
						userObj.token_expires_at = result.expires_at;
						userObj.loadUserData(settings.apiPath).then(() => {
							this.user = userObj;
							resolve(userObj);
						});
					}, (error) => {
						localStorage.removeItem('at');
						this.user = userObj;
						console.warn(`Authentication failed for existing token: ${error}`);
						reject();
					});
				} else {
					this.user = userObj;
					reject();
				}
			});
		},
		loadUserDatabase() {
			if (this.user.id.length === 0) {
				throw new Error('loadUserDatabase was dispatched with no real user loaded.');
			}

			const settings = useSettingsStore();

			// Call this when you need to load the userDatabase from the server.
			StringUtil.digestMessage(this.user.id).then((digestHex) => {
				httpUtil.get({ url: `${settings.apiPath}/_userdata/${digestHex}`, token: this.user.token, contentType: 'text/plain' }).then((result) => {
					this.userDatabase = result;
					this.checkForMigrationOfUserDatabase();
				}, (error) => {
					console.error(error);
				});
			});
		},
		checkForMigrationOfUserDatabase() {
			// Check if user has records stored in localStorage
			if (this.userStorage.list) {
				// console.log("Found locally stored flagged records, moving to db.");
				const userStorage = this.userStorage;
				const dbMarkedDocuments = cloneDeep(this.userDatabase.markedDocuments) || {};
				const oldMarkedDocuments = userStorage.list;

				for (const [key, value] of Object.entries(oldMarkedDocuments)) {
					if (dbMarkedDocuments.hasOwnProperty(key) === false) {
						const item = cloneDeep(value);
						delete item.label;
						for (let i = 0; i < item.tags.length; i++) {
							if (item.tags[i] === 'Directory care') {
								item.tags[i] = 'Flagged';
							}
						}

						dbMarkedDocuments[key] = item;
					}
				}

				// Save to db
				this.userDatabase.markedDocuments = dbMarkedDocuments;

				// Clean up the old list
				delete userStorage.list;
				this.userStorage = userStorage;
			}
		},
	}
});
