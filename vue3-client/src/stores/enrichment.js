import { defineStore } from "pinia";
import { assign } from 'lodash-es';
import { useInspectorStore } from "./inspector";

export const useEnrichmentStore = defineStore('enrichment', {
	state: () => ({
		enrichmentData: {
			source: null,
			target: null,
			result: null,
		},
	}),
	actions: {
		setEnrichmentSource(state, data) {
			const inspector = useInspectorStore();
			inspector.data.quoted = assign(data.quoted, inspector.data.quoted);
			this.enrichmentData.source = data;
		},
	}
});
