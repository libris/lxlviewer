import { dev } from '$app/env';
import type { UserSettings as UserSettingsType } from '#lib/types/userSettings.js';
import { UserSettings } from '#lib/utils/userSettings.svelte.js';
import { setContext, getContext } from 'svelte';

const KEY = Symbol.for('userSettings');

export function setUserSettings(settings: UserSettingsType) {
	return setContext(KEY, new UserSettings(settings));
}

export function getUserSettings() {
	const context = getContext<ReturnType<typeof setUserSettings>>(KEY);
	if (dev && !context) {
		console.trace('UserSettings context missing');
	}
	return context;
}
