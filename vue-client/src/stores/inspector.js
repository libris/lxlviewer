import { defineStore } from "pinia";
import { cloneDeep, each } from 'lodash-es';
import { useSettingsStore } from "./settings";
import { useUserStore } from "./user";

const EXTRACT_ON_SAVE = '__EXTRACT_ON_SAVE__';

export const useInspectorStore = defineStore('inspector', {
	state: () => ({
		data: {}, // TODO: Rename this property
		insertData: {},
		originalData: {},
		compositeHistoryData: {},
		languageCache: {},
		langTagSearch: '',
		supportedTagsInternal: {
			data: [],
			promises: [],
		},
		title: '',
		status: {
			detailedEnrichmentModal: {
				open: false,
			},
			saving: false,
			opening: false,
			lastAdded: '',
			editing: false,
			focus: 'mainEntity',
			removing: false,
			updating: false,
			isNew: false,
			readyForSave: true,
			embellished: [],
		},
		validation: {
			numberOfViolations: 0,
			violations: {},
		},
		clipboard: null,
		changeHistory: [],
		event: [],
		magicShelfMarks: [],
		extractItemsOnSave: {},
	}),
	getters: {
		// Drop in replacement for Vuex state that returns the entire state object. Do NOT use in new components!!
		// Bad practice. Use hook (useInspectorStore) or map all properties using mapState instead
		inspector: (state) => state,
		supportedTags: state => state.supportedTagsInternal.data,
	},
	actions: {
		setValidation(validation) {
			if (validation.validates) {
				if (this.validation.violations[validation.path]) {
					delete this.validation.violations[validation.path];
				}
			} else {
				this.validation.violations[validation.path] = validation.reasons;
			}

			this.validation.numberOfViolations = Object.keys(this.validation.violations).length;
		},
		addToLanguageCache(data) {
			const languageCache = cloneDeep(this.languageCache);
			for (const [key, value] of Object.entries(data)) {
				languageCache[key] = value;
			}

			this.languageCache = languageCache;
		},
		addToQuoted(data) {
			const quoted = cloneDeep(this.data.quoted);
			quoted[data['@id']] = data;
			(data.sameAs || []).forEach((sameAs) => {
				if (sameAs.hasOwnProperty('@id')) {
					quoted[sameAs['@id']] = data;
				}
			});

			this.data.quoted = quoted;
		},
		updateInspectorData(payload) {
			this.status.updating = true;

			// Clone inspectorData so we can manipulate it before setting it
			let inspectorData = cloneDeep(this.data);

			// Push old value to history
			if (payload.addToHistory) {
				const changes = [];
				each(payload.changeList, (node) => {
					let oldValue;
					if (node.path === '') {
						oldValue = inspectorData;
					} else {
						oldValue = cloneDeep(get(inspectorData, node.path));
					}
					const historyNode = { path: node.path, value: oldValue };
					changes.push(historyNode);
				});

				this.changeHistory.push(changes);
			}

			// Set the new values
			each(payload.changeList, (node) => {
				// console.log("DATA_UPDATE:", JSON.stringify(node));
				if (node.path === '') {
					inspectorData = node.value;
				} else {
					set(inspectorData, node.path, node.value);
				}
			});

			// Check if we should remove work node (if it went from local to being linked)
			if (inspectorData.mainEntity.hasOwnProperty('instanceOf') && (inspectorData.mainEntity.instanceOf === null || (inspectorData.mainEntity.instanceOf.hasOwnProperty('@id') && inspectorData.mainEntity.instanceOf['@id'].indexOf('#work') === -1))) {
				if (this.data.hasOwnProperty('work')) {
					delete inspectorData.work;
				}
			}

			// Apply everything
			this.data = Object.assign({}, inspectorData);
		},
		// TODO: Remove this action
		setInspectorStatusValue(payload) {
			if (this.status.hasOwnProperty(payload.property)) {
				this.status[payload.property] = payload.value;
			} else {
				throw new Error(`Trying to set unknown status property "${payload.property}" on inspector. Is it defined in the store?`);
			}
		},
		flushChangeHistory() {
			this.changeHistory = [];
		},
		addMagicShelfMark(path) {
			this.magicShelfMarks.push(path);
		},
		removeMagicShelfMark(path) {
			this.magicShelfMarks = this.magicShelfMarks.filter(p => p !== path);
		},
		async getIsTagRomanizable(tag) {
			const settings = useSettingsStore();
			const user = useUserStore().user;
			if (tag == null || tag === '') {
				return false;
			}

			if (this.supportedTagsInternal.promises[tag]) {
				return this.supportedTagsInternal.promises[tag];
			}

			const promise = httpUtil.get({
				url: `${settings.apiPath}/_transliterate/language/${tag}`,
				token: user.token,
			}).then((response) => {
				if (response != null && response.status > 200) {
					this.supportedTagsInternal.promises[tag] = undefined;
					if (this.supportedTagsInternal.data.indexOf(tag) === -1) {
						this.supportedTagsInternal.data.push(tag);
					}
				}
			});

			this.supportedTagsInternal.promises[tag] = promise;

			return promise;
		},
		undoInspectorChange() {
			const history = this.changeHistory;
			const lastNode = history[history.length - 1];

			const payload = { addToHistory: false, changeList: [] };
			each(lastNode, (node) => {
				if (typeof node.value !== 'undefined') {
					// It had a value
					payload.changeList.push({
						path: node.path,
						value: node.value,
					});
				} else {
					// It did not have a value (ie key did not exist)
					const pathParts = node.path.split('.');
					const key = pathParts[pathParts.length - 1];
					pathParts.splice(pathParts.length - 1, 1);
					const path = pathParts.join('.');
					const data = cloneDeep(get(this.data, path));
					delete data[key];
					payload.changeList.push({
						path: path,
						value: data,
					});
				}
			});

			history.splice(history.length - 1, 1);
			this.updateInspectorData(payload);
		},
		addExtractItemOnSave({ path, item }) {
			const extractItems = {
				...this.extractItemsOnSave,
				[path]: item,
			};

			this.extractItemsOnSave = extractItems;

			// Change value to constant indicating that the item should be extracted when clicking save.
			this.updateInspectorData({
				changeList: [
					{
						path,
						value: EXTRACT_ON_SAVE,
					},
				],
				addToHistory: true,
			});
		},
		removeExtractItemOnSave({ path }) {
			const {
				[path]: itemToRemove,
				...rest
			} = this.extractItemsOnSave;

			this.extractItemsOnSave = rest;

			const indexInChangeHistory = this.changeHistory.findIndex(item => item[0].path === path && item[0].value === EXTRACT_ON_SAVE);
			if (indexInChangeHistory >= 0) {
				this.changeHistory = this.changeHistory.filter((_, i) => i !== index);
			}
		},
		flushExtractItemsOnSave() {
			this.extractItemsOnSave = {};
		},
	},
});