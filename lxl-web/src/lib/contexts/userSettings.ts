import type { UserSettings as UserSettingsType } from '$lib/types/userSettings';
import { UserSettings } from '$lib/utils/userSettings.svelte';
import { setContext, getContext } from 'svelte';

const KEY = Symbol('userSettings');

export function setUserSettings(settings: UserSettingsType) {
	return setContext(KEY, new UserSettings(settings));
}

export function getUserSettings() {
	return getContext<ReturnType<typeof setUserSettings>>(KEY);
}
