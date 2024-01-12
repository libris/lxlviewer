<script lang="ts">
	export let data;
</script>

<h1>
	{data.t('home.welcome_text', {
		values: {
			site: 'Libris',
			day: `${(() =>
				new Intl.DateTimeFormat(data.locale, { weekday: 'long' }).format(new Date()))()}`
		}
	})}
</h1>
