import { writable } from 'svelte/store';
import type { MatomoTracker } from '$lib/types/matomo';

export const matomoTracker = writable<MatomoTracker>();
