import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { useSettingsStore } from "./settings";
import { each, filter } from 'lodash-es';

import * as VocabUtil from 'lxljs/vocab';
import * as StringUtil from 'lxljs/string';

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
		vocabClasses: null,
		vocabProperties: null,
	}),
	getters: {
		// Drop in replacement for Vuex state that returns the entire state object. Do NOT use in new components!!
		// Bad practice. Use hook (useResourcesStore) or map all properties using mapState instead
		resources: (state) => state,
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
	actions: {
		setupVocab(vocabData) {
			this.setVocab(vocabData);
			this.setVocabClasses(vocabData);
			this.setVocabProperties(vocabData);
		},
		setVocab(vocab) {
			this.vocab = new Map(vocab.map(entry => [entry['@id'], entry]));
		},
		setVocabClasses(vocab) {
			const settings = useSettingsStore();
			const classTerms = [].concat(
				VocabUtil.getTermByType('Class', vocab, this.context, settings),
				VocabUtil.getTermByType('marc:CollectionClass', vocab, this.context, settings),
			);

			const classes = new Map(classTerms.map(entry => [entry['@id'], entry]));
			classes.forEach((classObj) => {
				if (classObj.hasOwnProperty('subClassOf')) {
					each(classObj.subClassOf, (baseClass) => {
						const baseClassObj = classes.get(baseClass['@id']);
						if (typeof baseClassObj !== 'undefined') {
						if (baseClassObj.hasOwnProperty('baseClassOf')) {
							baseClassObj.baseClassOf.push(StringUtil.convertToPrefix(classObj['@id'], this.context));
						} else {
							baseClassObj.baseClassOf = [StringUtil.convertToPrefix(classObj['@id'], this.context)];
						}
						}
					});
				}
			});

			this.vocabClasses = classes;
		},
		setVocabProperties(vocab) {
			const settings = useSettingsStore();
			let props = [];

			props = props.concat(VocabUtil.getTermByType('Property', vocab, this.context, settings));
			props = props.concat(VocabUtil.getTermByType('DatatypeProperty', vocab, this.context, settings));
			props = props.concat(VocabUtil.getTermByType('ObjectProperty', vocab, this.context, settings));
			props = props.concat(VocabUtil.getTermByType('owl:SymmetricProperty', vocab, this.context, settings));

			this.vocabProperties = new Map(props.map(entry => [entry['@id'], entry]));
		},
		setTemplates(data) {
			const templates = {
				base: data.base,
				combined: {},
			};

			const combinedBaseTypes = Object.keys(data.combined);
			for (let i = 0; i < combinedBaseTypes.length; i++) {
				templates.combined[combinedBaseTypes[i]] = filter(data.combined[combinedBaseTypes[i]], (o) => {
					if (o.hasOwnProperty('status') && o.status === 'draft') {
						return false;
					}
					return true;
				});
			};

			this.templates = templates;
		},
	}
});
