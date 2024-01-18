<script lang="ts">
	export let data;
</script>

<div class="container">
	<h1 class="text-s6-cond-extrabold">
		{data.t('home.welcome_text', {
			site: 'Libris',
			day: `${(() => new Intl.DateTimeFormat(data.locale, { weekday: 'long' }).format(new Date()))()}`
		})}
	</h1>
</div>
