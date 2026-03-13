<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { fade } from 'svelte/transition';
	import { getUserSettings } from '$lib/contexts/userSettings';
	import { saveUserLocation } from '$lib/utils/geolocation.svelte';
	import type { LatLng } from '$lib/types/holdings';
	import Spinner from './Spinner.svelte';
	import BiToggleOff from '~icons/bi/toggle-off';
	import BiToggleOn from '~icons/bi/toggle-on';

	type Props = {
		location: LatLng | null;
	};

	const { location }: Props = $props();

	let error: string | null | GeolocationPositionError = $state(null);
	let loading = $state(false);

	const userSettings = getUserSettings();
	const prefersNearMe = userSettings?.prefersNearMe;

	const userLocation = $derived(location);
	const ToggleComponent = $derived(userLocation ? BiToggleOn : BiToggleOff);

	async function toggleNearMe() {
		if (userLocation) {
			saveUserLocation(null);
			userSettings.setPrefersNearMe(false);
		} else {
			loading = true;
			try {
				const _loc = await getUserLocation();
				saveUserLocation(_loc);
				userSettings.setPrefersNearMe(true);
				error = null;
			} catch (e) {
				userSettings.setPrefersNearMe(false);
				error = page.data.t(`geolocation.${e}`);
			} finally {
				loading = false;
			}
		}
	}

	function getUserLocation(): Promise<LatLng> {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject('unsupported');
				return;
			}

			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lng: position.coords.longitude
					});
				},
				(error) => {
					switch (error.code) {
						case error.PERMISSION_DENIED:
							reject('permissionDenied');
							break;

						case error.POSITION_UNAVAILABLE:
							reject('positionUnavailable');
							break;

						case error.TIMEOUT:
							reject('timeOut');
							break;

						default:
							reject('unknown');
					}
				},
				{
					enableHighAccuracy: true,
					timeout: 20000,
					maximumAge: 0
				}
			);
		});
	}

	onMount(() => {
		// saved location resets between reloads, try to get it again
		if (prefersNearMe && !userLocation) {
			toggleNearMe();
		}
	});
</script>

<div class="flex items-center gap-2" aria-busy={loading ? 'true' : undefined}>
	<button
		type="button"
		role="switch"
		aria-checked={!!userLocation}
		class="btn btn-ghost gap-2 text-sm sm:text-xs"
		onclick={toggleNearMe}
	>
		<span>
			{page.data.t('geolocation.sort')}
		</span>
		<ToggleComponent
			aria-hidden="true"
			class={['text-2xl', userLocation ? 'text-accent' : 'text-subtle']}
		/>
	</button>
	{#if loading}
		<span aria-hidden="true" class="my-1 flex size-4 justify-start" in:fade={{ delay: 200 }}>
			<Spinner />
		</span>
	{/if}
</div>
{#if error}
	<span role="alert" aria-atomic="true" class="text-severe-700 text-sm sm:text-xs">{error}.</span>
{/if}
