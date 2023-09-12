import { defineStore } from "pinia";
import { useSettingsStore } from "./settings";
import ClientOAuth2 from 'client-oauth2';

export const useOauthStore = defineStore('oauthstore', {
	state: () => ({
		client: {},
	}),
	getters: {
		oauthClient: (state) => state.client,
	},
	actions: {
		initOauth2Client() {
			const settings = useSettingsStore();
			const client = new ClientOAuth2({
				clientId: settings.clientId,
				authorizationUri: settings.authPath,
				redirectUri: settings.redirectPath,
				scopes: settings.scopes,
			});

			console.log('client', client);
			this.client = client;
		},
	}
});